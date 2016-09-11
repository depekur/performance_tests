var Atom = (function () {
    "use strict";
    /**
     * @type {Array}
     */
    var calculators = [];

    /**
     * Stores all selects names (<select name='SELECTS.NAME'>)
     *
     * @type {{SUBJECTS: string, CATEGORIES: string, DEADLINE: string, LEVEL: string, NUMBER_OF_PAGES: string}}
     */
    var SELECTS = {
        SUBJECTS: 'subject',
        CATEGORIES: 'assignment',
        DEADLINE: 'deadline',
        LEVEL: 'level',
        NUMBER_OF_PAGES: 'numpages'
    };

    /**
     * Enum of pattern variables, that can be used in <option> innerText building
     *
     * @type {{WORD_COUNT: string, MAX_PAGES: string}}
     */
    var TEXT_PATTERNS = {
        WORD_COUNT: '[wordCount]',
        MAX_PAGES: '[maxPages]'
    };

    /**
     * Spacing of calculator
     *
     * @type {{DOUBLE: boolean, SINGLE: boolean}}
     */
    var SPACING = {
        DOUBLE: true,
        SINGLE: false
    };

    var DEADLINES_NAMES = {
        h12: '12 hours',
        h24: '24 hours',
        h48: '48 hours',
        d3: '3 days',
        d4: '4 days',
        d5: '5 days',
        d7: '7 days',
        d10: '10 days',
        d14: '14 days',
        d20: '20 days',
        d30: '30 days',
        d60: '60 days',
    };

    /**
     * AbstractCalc
     * Stores base logic of all calculators types
     *
     * @class AbstractCalc
     * @abstract
     */
    function AbstractCalc() {
    }

    /**
     * builds Calculators DOM
     *
     * @method buildDOM
     */
    AbstractCalc.prototype.buildDOM = function () {
        var container = createContainer(this.params.wrapperClass);

        buildSelects.call(this, container);

        this.updateState();

        // deadline - level bind check after build
        if (this.selects[SELECTS.DEADLINE] && this.selects[SELECTS.LEVEL] && this.selects[SELECTS.NUMBER_OF_PAGES]) {
            //bindDeadlineLevel.call(this, this.selects[SELECTS.DEADLINE].select.value);
            bindLevelDeadline.call(this, this.selects[SELECTS.LEVEL].select.value);
        }

        showCalculator.call(this, container);
    };

    /**
     * Builds <select> block with options
     *
     * @method buildSelect
     * @param params - Object {
     * data: [Array] || [number], - builds select by given data array
     * name: [String] - name of the select
     * }
     *
     * [data] structure must be like:
     * data = [
     *  {name: 'Some name here', value: 'value'}
     *  {name: 'Some name here', value: 'value'}
     *  ...
     * ];
     * WHERE:
     * name - goes inside <option> element, like text
     * value - goes like "value" attribute
     */
    AbstractCalc.prototype.buildSelect = function (params) {
        if (!params) {
            throw new Error('Can\'t build' + '\<select\> without params');
        }

        var i,
            select = document.createElement('select'),
            option,
            optionInnerText,
            preparedDataArray,
            preparedDataArrayLength,
            pattern,
            spacing = this.getSpacing();

        select.name = params.name;

        preparedDataArray = getPreparedDataArray(params.data, spacing);
        pattern = getSelectsPattern(this, select.name);

        preparedDataArrayLength = preparedDataArray.length;

        for (i = 0; i < preparedDataArrayLength; i++) {
            optionInnerText = getOptionInnerText(preparedDataArray[i], spacing, pattern);
            option = createOption(optionInnerText, preparedDataArray[i].value);
            select.appendChild(option);
        }

        return select;
    };

    /**
     * rebuilds given select with given params
     *
     * @param params
     * data - new data for select
     * select - select object
     */
    AbstractCalc.prototype.rebuildSelect = function (params) {
        var select = params.select,
            selectObject = this.selects[select.name],
            selectCurrentState = selectObject.state,
            isOptionExists = false,
            optionIndex = 0,
            option,
            i,
            pattern,
            spacing = this.getSpacing(),

            preparedDataArray,
            preparedDataArrayLength,
            optionInnerText;

        select.innerHTML = '';

        preparedDataArray = getPreparedDataArray(params.data, spacing);
        pattern = getSelectsPattern(this, select.name);

        preparedDataArrayLength = preparedDataArray.length;

        for (i = 0; i < preparedDataArrayLength; i++) {
            optionInnerText = getOptionInnerText(preparedDataArray[i], spacing, pattern);
            option = createOption(optionInnerText, preparedDataArray[i].value);
            if (option.value === selectCurrentState) {
                isOptionExists = true;
                optionIndex = i;
            }
            select.appendChild(option);
        }

        if (isOptionExists === true) {
            select[optionIndex].selected = true;
        }

        selectObject.state = select[optionIndex].value;
    };

    /**
     * Checks <select>s by given dependencies,
     * and rebuilds some of them, if it's needed.
     *
     * @method checkSelects
     * @param changedSelect - <select> element, where onchange event fired
     */
    AbstractCalc.prototype.checkSelects = function (changedSelect) {
        var changedSelectObject = this.selects[changedSelect.name],
            oldState, _oldState,
            newValue, _newValue,
            category;

        oldState = changedSelectObject.state;
        newValue = changedSelect.value;

        if (oldState != newValue) {
            // check form buildingMode
            if (this.wasDataGiven !== true) {
                //dependencies
                switch (changedSelect.name) {
                    case SELECTS.SUBJECTS:
                        break;
                    case SELECTS.CATEGORIES:
                        // get type of category
                        _oldState = changedSelectObject.state.split('|')[0];
                        _newValue = changedSelect.value.split('|')[0];

                        if (_oldState != _newValue) {
                            if (this.selects[SELECTS.LEVEL]) {
                                this.rebuildSelect({
                                    select: this.selects[SELECTS.LEVEL].select,
                                    data: data.types[_newValue].level
                                });
                            }
                            if (this.selects[SELECTS.DEADLINE]) {
                                this.rebuildSelect({
                                    select: this.selects[SELECTS.DEADLINE].select,
                                    data: getDeadlineWithoutRush(data.types[_newValue].deadline)
                                });
                            }
                            if (this.selects[SELECTS.NUMBER_OF_PAGES]) {
                                var numberOfPages;

                                // TODO refactoring
                                // calc type check is a bad idea, it can be made clearer,
                                // by AbstractCalc new method maybe, or with new function
                                if (this instanceof TableCalc) {
                                    numberOfPages = data.types[_newValue].maxpages;
                                } else if (this instanceof RushCalc || this instanceof RushSmallCalc) {
                                    numberOfPages = 600;
                                } else {
                                    if (this.selects[SELECTS.DEADLINE]) {
                                        numberOfPages = data.maxPages[this.selects[SELECTS.DEADLINE].select.value];
                                    } else {
                                        numberOfPages = data.maxPages[data.types[_newValue].deadline[0].value];
                                    }
                                }

                                this.rebuildSelect({
                                    select: this.selects[SELECTS.NUMBER_OF_PAGES].select,
                                    data: numberOfPages
                                });
                            }
                        }
                        break;
                    case SELECTS.LEVEL:
                        if (this.selects[SELECTS.DEADLINE]) {
                            bindLevelDeadline.call(this, newValue);
                        }
                        break;
                    case SELECTS.DEADLINE:
                        category = this.selects[SELECTS.CATEGORIES].state.split('|')[0];

                        if (this.selects[SELECTS.NUMBER_OF_PAGES]) {
                            this.rebuildSelect({
                                select: this.selects[SELECTS.NUMBER_OF_PAGES].select,
                                data: data.maxPages[this.selects[SELECTS.DEADLINE].select.value]
                            });
                        }
                        //bindDeadlineLevel.call(this, newValue);

                        break;
                    case SELECTS.NUMBER_OF_PAGES:
                        break;
                    default:
                        throw new Error('Select name was not found in checkSelects() method. Check documentation.');
                        break;
                }
            }
            //update state
            changedSelectObject.state = newValue;

            // todo refactoring
            // this code must be inside case SELECTS.CATEGORIES,
            // but it only works, if SELECTS.CATEGORIES value was saved
            if (this.selects[SELECTS.DEADLINE] && this.selects[SELECTS.LEVEL]) {
                bindLevelDeadline.call(this, this.selects[SELECTS.LEVEL].select.value);
            }
        }

        this.updateState();
    };

    /**
     * updates current calculator state
     * save all calculator selects values + additional information
     *
     * must be called after all manipulations with calculator
     *
     * @method updateState
     */
    AbstractCalc.prototype.updateState = function () {
        var selects = this.selects,
            select,
            state = this.state;

        for (select in selects) {
            if (select != 'order' && selects.hasOwnProperty(select)) {
                state[select] = selects[select].state;
            }
        }

        state['time'] = Date.now();
        state['spacing'] = this.params.spacing;

        /**
         * !!! NOTE !!!
         * other state fields like: price_per_page, price, wordCount etc. must be realized in child classes!!!
         * use AbstractCalc.prototype.updateState.call(this) to get selects values!
         */
    };

    /**
     * checks current spacing
     *
     * @returns {boolean|*}
     * true -> doubleSpaced (275 words per page)
     * false -> singleSpaced (550 words per page)
     */
    AbstractCalc.prototype.getSpacing = function () {
        return this.params.spacing;
    };

    /**
     * sets spacing of the calculator
     *
     * true -> doubleSpaced (275 words per page)
     * false -> singleSpaced (550 words per page)
     *
     * @param bool
     */
    AbstractCalc.prototype.setSpacing = function (bool) {
        if (typeof bool === 'boolean') {
            this.params.spacing = bool;

            tryToRebuildSelects(this);

            this.updateState();
        } else {
            throw new Error('Spacing must be a boolean value, ' + typeof bool + ' is given.');
        }
    };

    /**
     * returns current calculator state
     *
     * @returns {*|{}|Object}
     */
    AbstractCalc.prototype.getState = function () {
        return this.state;
    };

    /**
     * returns current order price without discounts, points, etc
     *
     * @returns {number|*}
     */
    AbstractCalc.prototype.getPrice = function () {
        var price;
        if (this.state.price) {
            price = this.state.price;
        } else {
            price = 0;
        }
        return price;
    };

    /**
     * SelectsCalc
     */
    function SelectsCalc(params) {
        this.params = params;

        if (!params.selects) {
            this.params.selects = [
                {name: SELECTS.SUBJECTS},
                {name: SELECTS.CATEGORIES},
                {name: SELECTS.LEVEL},
                {name: SELECTS.DEADLINE},
                {name: SELECTS.NUMBER_OF_PAGES}
            ];
        }

        if (params.selects.length < 4) {
            throw Error('You must describe all least 4 selects for correct work. Please, check it.');
        }

        setDefaults.call(this, params);
    }

    inherit(SelectsCalc, AbstractCalc);

    SelectsCalc.prototype.getSelectsData = function (selectsParams) {
        var category,
            selectData,
            selectsName = selectsParams.name;

        // check <select>s order. [category] must by above [level], [deadline], [numOfPages]
        if (selectsName == SELECTS.NUMBER_OF_PAGES || selectsName == SELECTS.LEVEL || selectsName == SELECTS.DEADLINE) {
            if (this.selects[SELECTS.CATEGORIES] == undefined) {
                throw Error('\<select>s order is wrong. Check documentation.')
            }
            // if [category] is already defined - get it
            category = this.selects[SELECTS.CATEGORIES].select.value.split('|')[0];
        }

        switch (selectsName) {
            case SELECTS.SUBJECTS:
                selectData = data.subjects;
                break;
            case SELECTS.CATEGORIES:
                selectData = data.categories;
                break;
            case SELECTS.LEVEL:
                selectData = data.types[category][SELECTS.LEVEL];
                break;
            case SELECTS.DEADLINE:
                selectData = getDeadlineWithoutRush(data.types[category][SELECTS.DEADLINE]);
                break;
            case SELECTS.NUMBER_OF_PAGES:
                selectData = data.maxPages[getMaxDeadline(category)];
                break;
            default:
                throw new Error('Select name was not found. Check documentation.');
                break;
        }

        return selectData;
    };

    SelectsCalc.prototype.updateState = function () {
        var state = this.state,
            basePrice;

        AbstractCalc.prototype.updateState.call(this);

        state['price_per_page'] = data.types[state[SELECTS.CATEGORIES].split('|')[0]].ppp[state[SELECTS.DEADLINE]][state[SELECTS.LEVEL]];
        basePrice = (Math.round(state.price_per_page * state[SELECTS.NUMBER_OF_PAGES] * 100) / 100);
        state['price'] = (this.getSpacing()) ? basePrice : (basePrice * 2);
        state['wordCount'] = (this.getSpacing()) ? (275 * state[SELECTS.NUMBER_OF_PAGES]) : (550 * state[SELECTS.NUMBER_OF_PAGES]);
    };

    /**
     * Custom Calculator
     */
    function CustomCalc(params) {
        var j, len;

        this.params = params;

        if (!params.selects) {
            throw Error('Can\'t create Custom calculator without selects!')
        }

        setDefaults.call(this, params);

        j = 0;
        len = params.selects.length;

        this.wasDataGiven = true;
        // if at least 1 select DOESN'T contains data - ignore other data, and build select with default JSON
        for (j; j < len; j++) {
            if (params.selects[j].data == undefined) {
                this.wasDataGiven = false;
                console.warn('Can\'t find DATA for ' + params.selects[j].name + ' select building. IN ALL SELECTS will be used default JSON!');
                break;
            }
        }
    }

    inherit(CustomCalc, AbstractCalc);

    CustomCalc.prototype.getSelectsData = function (selectsParams) {
        var category,
            selectData,
            selectsName = selectsParams.name;

        if (!this.wasDataGiven) {
            // check <select>s order. [category] must by above [level], [deadline], [numOfPages]
            if (selectsName == SELECTS.NUMBER_OF_PAGES || selectsName == SELECTS.LEVEL || selectsName == SELECTS.DEADLINE) {
                if (this.selects[SELECTS.CATEGORIES] == undefined) {
                    throw Error('\<select>s order is wrong. Check documentation.');
                }
                category = this.selects[SELECTS.CATEGORIES].select.value.split('|')[0];
            }

            switch (selectsName) {
                case SELECTS.SUBJECTS:
                    selectData = data.subjects;
                    break;
                case SELECTS.CATEGORIES:
                    selectData = data.categories;
                    break;
                case SELECTS.LEVEL:
                    selectData = data.types[category][SELECTS.LEVEL];
                    break;
                case SELECTS.DEADLINE:
                    selectData = getDeadlineWithoutRush(data.types[category][SELECTS.DEADLINE]);
                    break;
                case SELECTS.NUMBER_OF_PAGES:
                    selectData = data.maxPages[data.types[category][SELECTS.DEADLINE][0].value];
                    break;
                default:
                    throw new Error('Select name was not found. Check documentation.');
                    break;
            }
        } else {
            selectData = selectsParams.data;
        }

        return selectData;
    };

    CustomCalc.prototype.updateState = function () {
        AbstractCalc.prototype.updateState.call(this);
    };

    /**
     * RushCalc
     */
    function RushCalc(params) {
        this.params = params;

        if (!params.selects) {
            this.params.selects = [
                {name: SELECTS.SUBJECTS},
                {name: SELECTS.CATEGORIES},
                {name: SELECTS.LEVEL},
                {name: SELECTS.NUMBER_OF_PAGES}
            ];
        }

        if (params.selects.length != 4) {
            throw Error('RushCalc must contain 4 fields, ' + params.selects.length + ' was given!');
        }

        setDefaults.call(this, params);
    }

    inherit(RushCalc, AbstractCalc);

    RushCalc.prototype.getSelectsData = function (selectsParams) {
        var category,
            selectData,
            selectsName = selectsParams.name;

        // check <select>s order. [category] must by above [level], [numOfPages]
        if (selectsName == SELECTS.NUMBER_OF_PAGES || selectsName == SELECTS.LEVEL) {
            if (this.selects[SELECTS.CATEGORIES] == undefined) {
                throw Error('\<select>s order is wrong. Check documentation.')
            }
            // if [category] is already defined - get it
            category = this.selects[SELECTS.CATEGORIES].select.value.split('|')[0];
        }

        switch (selectsName) {
            case SELECTS.SUBJECTS:
                selectData = data.subjects;
                break;
            case SELECTS.CATEGORIES:
                selectData = data.categories;
                break;
            case SELECTS.LEVEL:
                selectData = data.types[category][SELECTS.LEVEL];
                break;
            case SELECTS.DEADLINE:
                throw new Error('RushCalc with deadline \<select>! can not be created! Deadline is fixed here.');
                break;
            case SELECTS.NUMBER_OF_PAGES:
                //selectData = data.maxPages[data.types[category][SELECTS.DEADLINE][0].value];
                selectData = 600;
                break;
            default:
                throw new Error('Select name was not found. Check documentation.');
                break;
        }

        return selectData;
    };

    RushCalc.prototype.updateState = function () {
        var state = this.state,
            days, hours, d, h, deadlineDate,
            coef = (this.getSpacing()) ? 1 : 2;


        AbstractCalc.prototype.updateState.call(this);

        state['price_per_page'] = 49; // rush ppp is fixed
        state['price'] = coef * state[SELECTS.NUMBER_OF_PAGES] * state['price_per_page'];
        state['wordCount'] = (this.getSpacing()) ? (275 * state[SELECTS.NUMBER_OF_PAGES]) : (550 * state[SELECTS.NUMBER_OF_PAGES]);

        // example: n = 13
        // days = 13 / 8 | 0 = 1.625 | 0 = 1
        // hours = 13 - (1 * 8) = 5
        days = (+state[SELECTS.NUMBER_OF_PAGES] * coef) / 8 | 0;
        hours = (+state[SELECTS.NUMBER_OF_PAGES] * coef) - (days * 8);
        // deadline: in 1 day 5 hours
        d = (days === 0) ? '' : (' ' + days + ((days === 1) ? ' day' : ' days'));
        h = (hours === 0) ? '' : (' ' + hours + ((hours === 1) ? ' hour' : ' hours'));

        // for k*8, k = 1,2,3,4...
        // we need to set "in (k-1) day/s 8 hours"
        if (days > 0 && hours === 0) {
            if (days === 1) {
                d = '';
            } else {
                d = ' ' + (days - 1) + (((days - 1) === 1) ? ' day' : ' days');
            }
            h = ' 8 hours';
        }

        deadlineDate = Date.now() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);

        state['deadline'] = 'in' + d + h;
        state['date'] = new Date(deadlineDate);
    };

    RushCalc.prototype.getDeadline = function () {
        return this.state.deadline;
    };

    RushCalc.prototype.getDate = function () {
        return this.state.date;
    };

    /**
     * Small RUSH Calculator
     */
    function RushSmallCalc(params) {
        var j = 0;

        this.params = params;

        if (!params.selects) {
            this.params.selects = [
                {'name': Atom.SELECTS.SUBJECTS, 'data': data.subjects},
                {'name': Atom.SELECTS.NUMBER_OF_PAGES, 'data': 140}
            ];
        }

        var i = 0,
            len = params.selects.length,
            nop = false; // we don't see NUMBER_OF_PAGES select here

        if (len >= 4) {
            throw Error('RushSmallCalc can contain < 4 fields, ' + params.selects.length + ' was given!');
        }

        for (i; i < len; i++) {
            if (this.params.selects[i].name === SELECTS.NUMBER_OF_PAGES) {
                nop = true; // found NUMBER_OF_PAGES
            }
            if (this.params.selects[i].name === SELECTS.DEADLINE) {
                throw new Error('RushSmallCalc with deadline \<select>! can not be created! Deadline is fixed here.');
            }
        }
        // if NUMBER_OF_PAGES was not found ->
        if (!nop) {
            throw Error('SELECTS.NUMBER_OF_PAGES is required for building Small Rush Caclulator. Check your inputs, or use another calculator type.');
        }

        setDefaults.call(this, params);

        this.wasDataGiven = true;

        // if at least 1 select DOESN'T contains data - ignore other data, and build select with default JSON
        for (j; j < len; j++) {
            if (params.selects[j].data == undefined) {
                this.wasDataGiven = false;
                console.warn('Can\'t find DATA for ' + params.selects[j].name + ' select building. IN ALL SELECTS will be used default JSON!');
                break;
            }
        }
    }

    inherit(RushSmallCalc, AbstractCalc);

    RushSmallCalc.prototype.getSelectsData = function (selectsParams) {
        return CustomCalc.prototype.getSelectsData.call(this, selectsParams);
    };

    RushSmallCalc.prototype.updateState = function () {
        RushCalc.prototype.updateState.call(this);
    };

    RushSmallCalc.prototype.getDeadline = function () {
        return RushCalc.prototype.getDeadline.call(this);
    };

    /**
     * Table Calculator
     */
    function TableCalc(params) {
        /**
         * stores all given params, needed for building
         *
         * @property params
         * @type {*} Object
         */
        this.params = params;

        // params checking and adding defaults
        // check <select>s order and asc/desc
        if (!params.selects) {
            this.params.selects = [
                {'name': Atom.SELECTS.SUBJECTS},
                {'name': Atom.SELECTS.CATEGORIES},
                {'name': Atom.SELECTS.NUMBER_OF_PAGES}
            ];
        }

        setDefaults.call(this, params);

        // default class for table calculator container block
        this.params.tableCalculatorContainerClass = (params.tableCalculatorContainerClass == undefined) ? 'tableCalculator' : params.tableCalculatorContainerClass;
        this.params.tableContainerClass = (params.tableContainerClass == undefined) ? 'tableContainer' : params.tableContainerClass;
    }

    inherit(TableCalc, AbstractCalc);

    TableCalc.prototype.buildDOM = function () {
        var selectsContainer = createContainer(this.params.wrapperClass),
            tableContainer = createContainer(this.params.tableContainerClass),
            tableCalculatorContainer = createContainer(this.params.tableCalculatorContainerClass);

        buildSelects.call(this, selectsContainer, true);

        this.updateState();

        this.table = this.getTable();

        tableContainer.appendChild(this.table);
        tableCalculatorContainer.appendChild(selectsContainer);
        tableCalculatorContainer.appendChild(tableContainer);

        showCalculator.call(this, tableCalculatorContainer);
    };

    TableCalc.prototype.getSelectsData = function (selectsParams) {
        var category,
            selectData,
            selectsName = selectsParams.name;

        // check <select>s order. [category] must by above [level], [numOfPages]
        if (selectsName == SELECTS.NUMBER_OF_PAGES) {
            if (this.selects[SELECTS.CATEGORIES] == undefined) {
                throw Error('\<select>s order is wrong. Check documentation.')
            }
            // if [category] is already defined - get it
            category = this.selects[SELECTS.CATEGORIES].select.value.split('|')[0];
        }

        switch (selectsName) {
            case SELECTS.SUBJECTS:
                selectData = data.subjects;
                break;
            case SELECTS.CATEGORIES:
                selectData = data.categories;
                break;
            case SELECTS.NUMBER_OF_PAGES:
                selectData = data.types[category].maxpages;
                break;
            default:
                throw new Error('Select name was not found. Check documentation.');
                break;
        }

        return selectData;
    };

    TableCalc.prototype.getTable = function () {
        var table = document.createElement('table'),
            state = this.getState(),
            thead = document.createElement('thead'),
            tbody = document.createElement('tbody'),
            headings = document.createElement('tr'),
            category = state[Atom.SELECTS.CATEGORIES].split('|')[0],
            levelArray = data.types[category].level,
            levelArrayLength = levelArray.length,
            deadlineArray = getDeadlineWithoutRush(data.types[category].deadline),
            deadlineArrayLength = deadlineArray.length,
            selectedNumberOfPages = state[Atom.SELECTS.NUMBER_OF_PAGES],
            th,
            td,
            i;

        for (i = 0; i <= levelArrayLength; i++) {
            th = document.createElement('th');
            if (i === 0) {
                th.innerText = 'Deadline';
            } else {
                th.innerText = levelArray[i - 1].value;
            }
            headings.appendChild(th);
        }

        thead.appendChild(headings);

        for (i = 0; i < deadlineArrayLength; i++) {
            var deadlineRow = document.createElement('tr'),
                deadlineTd = document.createElement('td'),
                priceObject = data.types[category].ppp[deadlineArray[i].value],
                maxNumberOfPagesForDeadline = data.maxPages[deadlineArray[i].value];

            deadlineTd.innerText = deadlineArray[i].name;
            deadlineRow.appendChild(deadlineTd);

            for (var j = 0; j < levelArrayLength; j++) {
                var priceValue = priceObject[levelArray[j].value] * state[Atom.SELECTS.NUMBER_OF_PAGES];

                if (!priceValue || (selectedNumberOfPages > maxNumberOfPagesForDeadline)) {
                    priceValue = '--';
                } else {
                    priceValue = priceValue.toFixed(2);
                }

                td = document.createElement('td');

                td.setAttribute('data-deadline', deadlineArray[i].value);
                td.setAttribute('data-level', levelArray[j].value);

                td.innerText = priceValue;

                deadlineRow.appendChild(td);
            }

            tbody.appendChild(deadlineRow);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    };

    TableCalc.prototype.rebuildTable = function () {
        var oldTable = this.table,
            newTable = this.getTable(),
            selector = '.' + this.params.tableCalculatorContainerClass + ' .' + this.params.tableContainerClass;

        this.params.HTMLElement.querySelector(selector).replaceChild(newTable, oldTable);

        this.table = newTable;
    };

    /**
     * Additional functions
     */
    function setDefaults(params) {
        // true = doubleSpaced
        // false = singleSpaced
        this.params.spacing = (params.spacing == undefined) ? SPACING.DOUBLE : params.spacing;

        // default class for selects wrapper, if nothing was given
        this.params.wrapperClass = (params.wrapperClass == undefined) ? 'calcWrapper' : params.wrapperClass;
        // default class for selects
        this.params.selectClass = (params.selectClass == undefined) ? 'selectWrapper' : params.selectClass;

        this.selects = {
            'order': []
        };

        this.state = {};
    }

    function createContainer(wrapperClass) {
        var container = document.createElement('div');

        addClasses(container, wrapperClass);

        return container;
    }

    function addClasses(elem, classesTypedBySpace) {
        var classes = classesTypedBySpace.split(' '),
            i = 0, len = classes.length;

        for (i; i < len; i++) {
            elem.classList.add(classes[i] + '');
        }
    }

    function buildSelects(container, isTableCalc) {
        var params = this.params,
            i = 0,
            len = params.selects.length,
            select;

        for (i; i < len; i++) {
            var div = document.createElement('div'),
                label = document.createElement('label'),
                selectParams = params.selects[i],
                selectsName = selectParams.name;

            addClasses(div, params.selectClass);

            label.innerText = (selectParams.label) ? selectParams.label : selectsName;
            div.appendChild(label);

            select = this.buildSelect({
                data: this.getSelectsData(selectParams),
                name: selectsName
            });

            setSelectsDataAttributes(select, params.selects[i]);

            div.appendChild(select);

            addEventListeners(select, this, isTableCalc);

            // save link to select, it's order and default value
            this.selects[selectsName] = {
                select: select,
                order: i,
                state: select.value
            };
            this.selects.order.push(select.name);

            container.appendChild(div);
        }
    }

    function bindDeadlineLevel(deadline) {
        var category = this.selects[SELECTS.CATEGORIES].state.split('|')[0],
            pppObjectDeadlines = data.types[category].ppp[deadline],
            levels = [];

        for (var level in pppObjectDeadlines) {
            if (pppObjectDeadlines.hasOwnProperty(level)) {
                levels.push({"name": level, "value": level});
            }
        }

        if (this.selects[SELECTS.LEVEL]) {
            if (!arraysEqual(this.selects[SELECTS.LEVEL].select, levels)) {
                this.rebuildSelect({
                    select: this.selects[SELECTS.LEVEL].select,
                    data: levels
                });
            }
        }
    }

    function bindLevelDeadline(level) {
        var category = this.selects[SELECTS.CATEGORIES].state.split('|')[0],
            pppObject = data.types[category].ppp,
            deadlines = [];

        for (var deadline in pppObject) {
            if (pppObject.hasOwnProperty(deadline) && deadline !== 'h1') {
                var deadlineObject = pppObject[deadline];
                if (deadlineObject.hasOwnProperty(level)) {
                    deadlines.push({"name": DEADLINES_NAMES[deadline], "value": deadline});
                }
            }
        }

        if (this.selects[SELECTS.DEADLINE]) {
            if (!arraysEqual(this.selects[SELECTS.DEADLINE].select, deadlines)) {
                this.rebuildSelect({
                    select: this.selects[SELECTS.DEADLINE].select,
                    data: getDeadlineWithoutRush(deadlines)
                });
            }
        }

        this.updateState();

        // todo refactoring
        // after SELECTS.CATEGORIES change level and deadline can change also, and NUMBER OF PAGES too
        // but if bindLevelDeadline() has changed deadline - NUMBER OF PAGES select is not rebuilding now
        if (this.selects[SELECTS.NUMBER_OF_PAGES]) {
            this.rebuildSelect({
                select: this.selects[SELECTS.NUMBER_OF_PAGES].select,
                data: data.maxPages[this.selects[SELECTS.DEADLINE].select.value]
            });
        }

        this.updateState();
    }

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }

    function getDeadlineWithoutRush(array) {
        var badDeadlines = array,
            badDeadlinesLen = badDeadlines.length,
            clearDeadlines = [];

        for (var i = 0; i < badDeadlinesLen; i++) {
            if (badDeadlines[i].value !== "h1") {
                clearDeadlines.push(badDeadlines[i]);
            }
        }

        return clearDeadlines;
    }

    function getMaxDeadline(category) {
        var deadline = data.types[category][SELECTS.DEADLINE][0].value;

        if (deadline === 'h1') {
            deadline = data.types[category][SELECTS.DEADLINE][1].value;
        }

        return deadline;
    }

    function setSelectsDataAttributes(selectElement, selectParams) {
        if (selectParams.placeholder) {
            selectElement.setAttribute('data-placeholder', selectParams.placeholder);
        }

        if (selectParams.size) {
            selectElement.setAttribute('data-size', selectParams.size);
        }
    }

    function addEventListeners(selectElement, calculator, isTableCalc) {
        // add change/selectChange event listener
        // change is default event, but it can be overwritten, or prevented
        // selectChange - is Atoms change event, it will work correctly, but you must
        // dispatch it @with your hands@, like select.dispatchEvent(Atom.changeSimulation());
        selectElement.addEventListener('change', function (e) {
            calculator.checkSelects(e.target);
            if (isTableCalc) {
                calculator.rebuildTable();
            }
        });
        selectElement.addEventListener('selectChange', function (e) {
            calculator.checkSelects(e.target);
            if (isTableCalc) {
                calculator.rebuildTable();
            }
        });
    }

    function showCalculator(container) {
        this.params.HTMLElement.innerHTML = '';
        this.params.HTMLElement.appendChild(container);
    }

    function createOption(text, value) {
        var option = document.createElement('option');
        option.innerText = text;
        option.value = value;
        return option;
    }

    function getOptionInnerText(optionData, spacing, pattern) {
        var editedText = optionData.name,
            replacedText = '';

        if (pattern) {
            if (pattern.search(TEXT_PATTERNS.MAX_PAGES) != -1) {
                if (spacing === SPACING.DOUBLE) {
                    replacedText = data.maxPages[optionData.value];
                } else {
                    replacedText = data.maxPages[optionData.value] / 2;
                }
                pattern = pattern.replace(TEXT_PATTERNS.MAX_PAGES, replacedText);
            }

            if (pattern.search(TEXT_PATTERNS.WORD_COUNT) != -1) {
                if (spacing === SPACING.DOUBLE) {
                    replacedText = optionData.name * 275;
                } else {
                    replacedText = optionData.name * 550;
                }
                pattern = pattern.replace(TEXT_PATTERNS.WORD_COUNT, replacedText);
            }

            editedText += pattern;
        }

        return editedText;
    }

    function getPreparedDataArray(data, spacing) {
        var preparedDataArray = [],
            inputDataLength = (!data.length) ? data : data.length;

        if (data instanceof Array) {
            preparedDataArray = data;
        } else {
            if (spacing === SPACING.SINGLE) {
                inputDataLength = inputDataLength / 2;
            }
            for (var j = 2; j <= inputDataLength; j++) { // 2 = min_pages
                preparedDataArray.push({
                    name: j,
                    value: j
                });
            }
        }

        return preparedDataArray;
    }

    function getSelectsPattern(calculator, selectName) {
        var i,
            pattern = '',
            selects = calculator.params.selects,
            selectsCount = selects.length;

        for (i = 0; i < selectsCount; i++) {
            if (selects[i].name === selectName) {
                pattern = selects[i].pattern;
            }
        }

        return pattern;
    }

    function tryToRebuildSelects(abstractCalc) {
        var category;

        try {
            category = abstractCalc.selects[SELECTS.CATEGORIES].select.value.split('|')[0];

            if (abstractCalc.selects[SELECTS.DEADLINE]) {
                abstractCalc.rebuildSelect({
                    select: abstractCalc.selects[SELECTS.DEADLINE].select,
                    data: getDeadlineWithoutRush(data.types[category].deadline)
                });

                bindLevelDeadline.call(abstractCalc, abstractCalc.getState()[SELECTS.LEVEL]);
            }
            if (abstractCalc.selects[SELECTS.NUMBER_OF_PAGES]) {
                var numberOfPages;

                // todo refactoring
                // check for calc type is bad idea, it can be made clearer
                if (abstractCalc instanceof RushCalc ||
                    abstractCalc instanceof RushSmallCalc) {
                    numberOfPages = 600;
                } else {
                    numberOfPages = data.maxPages[abstractCalc.selects[SELECTS.DEADLINE].state]
                }

                abstractCalc.rebuildSelect({
                    select: abstractCalc.selects[SELECTS.NUMBER_OF_PAGES].select,
                    data: numberOfPages
                });
            }
        } catch (e) {
            console.warn(e + ' \n Check your calculator type. Spacing change can be caused only in' +
                ' {selects} and {rush} calculators');
        }
    }

    function inherit(C, P) {
        var F = function () {
        };
        F.prototype = P.prototype;
        C.prototype = new F();
        C.uber = P.prototype;
        C.prototype.constructor = C;
    }

    function isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    /**
     * Atom object
     */
    return {
        SELECTS: SELECTS,
        SPACING: SPACING,
        TEXT_PATTERNS: TEXT_PATTERNS,
        /**
         * createCalc - creates different calculators with same logic on pages
         *
         * @param params - object with params to create calculator. [!params - are REQUIRED]
         *
         * !HTMLElement - DOM element (!!), where calculators code will be inserted (<div></div> etc)
         * !type - type of the calculator. Now supporting types are: 'sidebar', 'table', 'full'
         * selects - [Array], each element is an object, that describes <select>s in building order.
         * !!!NOTE!!!:  [categories] <select> must be BEFORE [level] and [deadline] <select>.
         *
         * selects example code:
         * var selects = [ // asc logic is not realized yet
         *  {name: 'subjects', asc: true},
         *  {name: 'categories', asc: true},
         *  {name: 'level', asc: true},
         *  {name: 'deadline', asc: true},
         *  {name: 'numOfPages', asc: false}
         * ]
         *
         * @returns {AbstractCalc} - calculator object
         */
        createCalc: function (params) {
            if (!params) {
                throw new Error('Trying to createCalc without params! Check documentation!');
            }

            if (!params.HTMLElement) {
                throw new Error('HTMLElement is not defined. Check documentation!');
            } else {
                if (!(params.HTMLElement instanceof HTMLElement)) {
                    throw new Error('HTMLElement is not an HTMLElement object. Check documentation!');
                }
            }

            if (!params.type) {
                throw new Error('Type of calculator is undefined. Check documentation!');
            }

            var calc;

            switch (params.type) {
                case 'table':
                    calc = new TableCalc(params);
                    break;
                case 'selects':
                    calc = new SelectsCalc(params);
                    break;
                case 'custom':
                    calc = new CustomCalc(params);
                    break;
                case 'rush':
                    calc = new RushCalc(params);
                    break;
                case 'rush_small':
                    calc = new RushSmallCalc(params);
                    break;
                default:
                    throw new Error('Atom type [' + params.type + '] does not exists. Check documentation.');
                    break;
            }

            calculators.push(calc);

            calc.buildDOM();

            if (params.callback && isFunction(params.callback)) {
                params.callback();
            }

            return calc;
        },
        /**
         * returns selectChange event simulation
         *
         * must be used when default change event is not working
         * [for some additional plugins, like SelectOrDie]
         *
         * @returns {Event}
         */
        changeSimulation: function () {
            return new CustomEvent('selectChange', {
                bubbles: true,
                cancelable: true,
                view: window
            });
        },
        getCalculators: function (id) {
            if (!id) {
                return calculators;
            } else {
                if ((id instanceof Number) && (id < calculators.length) && (id >= 0)) {
                    return calculators[id];
                } else {
                    throw new Error('Check input params. ([id] is not a number, or not such [id] found in calculators)')
                }
            }
        },
        clearCalculators: function () {
            calculators = [];
        }
    }
}());


/**
 * Custom Event Polyfill for ie 9+
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function () {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
/*global self, document, DOMException */
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
if ("document" in self) {

// Full polyfill for browsers with no classList support
    if (!("classList" in document.createElement("_"))) {

        (function (view) {

            "use strict";

            if (!('Element' in view)) return;

            var
                classListProp = "classList"
                , protoProp = "prototype"
                , elemCtrProto = view.Element[protoProp]
                , objCtr = Object
                , strTrim = String[protoProp].trim || function () {
                        return this.replace(/^\s+|\s+$/g, "");
                    }
                , arrIndexOf = Array[protoProp].indexOf || function (item) {
                        var
                            i = 0
                            , len = this.length
                            ;
                        for (; i < len; i++) {
                            if (i in this && this[i] === item) {
                                return i;
                            }
                        }
                        return -1;
                    }
            // Vendors: please allow content code to instantiate DOMExceptions
                , DOMEx = function (type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                }
                , checkTokenAndGetIndex = function (classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR"
                            , "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR"
                            , "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                }
                , ClassList = function (elem) {
                    var
                        trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                        , i = 0
                        , len = classes.length
                        ;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function () {
                        elem.setAttribute("class", this.toString());
                    };
                }
                , classListProto = ClassList[protoProp] = []
                , classListGetter = function () {
                    return new ClassList(this);
                }
                ;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function () {
                var
                    tokens = arguments
                    , i = 0
                    , l = tokens.length
                    , token
                    , updated = false
                    ;
                do {
                    token = tokens[i] + "";
                    if (checkTokenAndGetIndex(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function () {
                var
                    tokens = arguments
                    , i = 0
                    , l = tokens.length
                    , token
                    , updated = false
                    , index
                    ;
                do {
                    token = tokens[i] + "";
                    index = checkTokenAndGetIndex(this, token);
                    while (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                        index = checkTokenAndGetIndex(this, token);
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token, force) {
                token += "";

                var
                    result = this.contains(token)
                    , method = result ?
                    force !== true && "remove"
                        :
                    force !== false && "add"
                    ;

                if (method) {
                    this[method](token);
                }

                if (force === true || force === false) {
                    return force;
                } else {
                    return !result;
                }
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter
                    , enumerable: true
                    , configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    } else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.
        (function () {
            "use strict";

            var testElement = document.createElement("_");

            testElement.classList.add("c1", "c2");

            // Polyfill for IE 10/11 and Firefox <26, where classList.add and
            // classList.remove exist but support only one argument at a time.
            if (!testElement.classList.contains("c2")) {
                var createMethod = function (method) {
                    var original = DOMTokenList.prototype[method];

                    DOMTokenList.prototype[method] = function (token) {
                        var i, len = arguments.length;

                        for (i = 0; i < len; i++) {
                            token = arguments[i];
                            original.call(this, token);
                        }
                    };
                };
                createMethod('add');
                createMethod('remove');
            }

            testElement.classList.toggle("c3", false);

            // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
            // support the second argument.
            if (testElement.classList.contains("c3")) {
                var _toggle = DOMTokenList.prototype.toggle;

                DOMTokenList.prototype.toggle = function (token, force) {
                    if (1 in arguments && !this.contains(token) === !force) {
                        return force;
                    } else {
                        return _toggle.call(this, token);
                    }
                };

            }

            testElement = null;
        }());
    }
}

/**
 * console dirty emulation for ie9, with switched off console
 */
if (!(window.console && console.log)) {
    console = {
        log: function () {
        },
        debug: function () {
        },
        info: function () {
        },
        warn: function () {
        },
        error: function () {
        }
    };
}