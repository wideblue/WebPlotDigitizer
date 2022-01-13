var TheDatepicker;
(function (TheDatepicker) {
    var CannotParseDateException = (function () {
        function CannotParseDateException() {
        }
        return CannotParseDateException;
    }());
    TheDatepicker.CannotParseDateException = CannotParseDateException;
    var ParsedDateData = (function () {
        function ParsedDateData() {
            this.day = null;
            this.month = null;
            this.year = null;
        }
        ParsedDateData.prototype.createDate = function () {
            if (this.day === null || this.month === null || this.year === null) {
                throw new CannotParseDateException();
            }
            var date = new Date(this.year, this.month - 1, this.day);
            if (isNaN(date.getTime())) {
                throw new CannotParseDateException();
            }
            while (date.getDate() !== this.day || date.getMonth() !== this.month - 1 || date.getFullYear() !== this.year) {
                if (this.day > 28) {
                    this.day--;
                    date = new Date(this.year, this.month - 1, this.day);
                }
                else {
                    throw new CannotParseDateException();
                }
            }
            return date;
        };
        return ParsedDateData;
    }());
    var DateConverter_ = (function () {
        function DateConverter_(options_) {
            this.options_ = options_;
            this.escapeChar_ = '\\';
        }
        DateConverter_.prototype.formatDate_ = function (format, date) {
            if (!date) {
                return null;
            }
            var escapeNext = false;
            var result = '';
            for (var position = 0; position < format.length; position++) {
                var char = format.substring(position, position + 1);
                if (escapeNext) {
                    result += char;
                    escapeNext = false;
                    continue;
                }
                if (char === this.escapeChar_) {
                    escapeNext = true;
                    continue;
                }
                var formatter = this.getFormatter_(char);
                if (formatter) {
                    result += formatter.call(this, date);
                    continue;
                }
                result += char;
            }
            return result;
        };
        DateConverter_.prototype.parseDate_ = function (format, text, minDate, maxDate) {
            if (text === '') {
                return null;
            }
            var dateData = new ParsedDateData();
            var escapeNext = false;
            var textPosition = 0;
            for (var position = 0; position < format.length; position++) {
                var char = format.substring(position, position + 1);
                if (escapeNext) {
                    escapeNext = false;
                }
                else if (char === this.escapeChar_) {
                    escapeNext = true;
                    continue;
                }
                else {
                    var parser = this.getParser_(char);
                    if (parser) {
                        try {
                            textPosition += parser.call(this, text.substring(textPosition), dateData, minDate, maxDate);
                        }
                        catch (error) {
                            if (!(error instanceof CannotParseDateException)) {
                                throw error;
                            }
                            var textChar_1 = text.substring(textPosition, textPosition + 1);
                            if (textChar_1 === ' ') {
                                textPosition++;
                                position--;
                                continue;
                            }
                            else {
                                throw error;
                            }
                        }
                        continue;
                    }
                }
                var textChar = text.substring(textPosition, textPosition + 1);
                if (textChar !== char) {
                    if (char === ' ') {
                        continue;
                    }
                    if (textChar === ' ') {
                        textPosition++;
                        position--;
                        continue;
                    }
                    throw new CannotParseDateException();
                }
                textPosition++;
            }
            return dateData.createDate();
        };
        DateConverter_.prototype.isValidChar_ = function (format, textChar) {
            if (textChar === '' || /[0-9-]/.test(textChar)) {
                return true;
            }
            var escapeNext = false;
            for (var position = 0; position < format.length; position++) {
                var char = format.substring(position, position + 1);
                if (escapeNext) {
                    escapeNext = false;
                }
                else if (char === this.escapeChar_) {
                    escapeNext = true;
                    continue;
                }
                else {
                    var phrases = this.getValidPhrases_(char);
                    if (phrases) {
                        var textCharLower = textChar.toLowerCase();
                        for (var index = 0; index < phrases.length; index++) {
                            if (phrases[index].toLowerCase().indexOf(textCharLower) > -1) {
                                return true;
                            }
                        }
                        continue;
                    }
                }
                if (textChar === char) {
                    return true;
                }
            }
            return false;
        };
        DateConverter_.prototype.getFormatter_ = function (type) {
            switch (type) {
                case 'j':
                    return this.formatDay_;
                case 'd':
                    return this.formatDayWithLeadingZero_;
                case 'D':
                    return this.formatDayOfWeekTextual_;
                case 'l':
                    return this.formatDayOfWeekTextualFull_;
                case 'n':
                    return this.formatMonth_;
                case 'm':
                    return this.formatMonthWithLeadingZero_;
                case 'F':
                    return this.formatMonthTextual_;
                case 'M':
                    return this.formatMonthTextualShort_;
                case 'Y':
                    return this.formatYear_;
                case 'y':
                    return this.formatYearTwoDigits_;
                default:
                    return null;
            }
        };
        DateConverter_.prototype.formatDay_ = function (date) {
            return date.getDate() + '';
        };
        DateConverter_.prototype.formatDayWithLeadingZero_ = function (date) {
            return ('0' + date.getDate()).slice(-2);
        };
        DateConverter_.prototype.formatDayOfWeekTextual_ = function (date) {
            return this.options_.translator.translateDayOfWeek(date.getDay());
        };
        DateConverter_.prototype.formatDayOfWeekTextualFull_ = function (date) {
            return this.options_.translator.translateDayOfWeekFull(date.getDay());
        };
        DateConverter_.prototype.formatMonth_ = function (date) {
            return (date.getMonth() + 1) + '';
        };
        DateConverter_.prototype.formatMonthWithLeadingZero_ = function (date) {
            return ('0' + (date.getMonth() + 1)).slice(-2);
        };
        DateConverter_.prototype.formatMonthTextual_ = function (date) {
            return this.options_.translator.translateMonth(date.getMonth());
        };
        DateConverter_.prototype.formatMonthTextualShort_ = function (date) {
            return this.options_.translator.translateMonthShort(date.getMonth());
        };
        DateConverter_.prototype.formatYear_ = function (date) {
            return date.getFullYear() + '';
        };
        DateConverter_.prototype.formatYearTwoDigits_ = function (date) {
            var year = date.getFullYear() + '';
            return year.substring(year.length - 2);
        };
        DateConverter_.prototype.getParser_ = function (type) {
            switch (type) {
                case 'j':
                case 'd':
                    return this.parseDay_;
                case 'D':
                    return this.parseDayOfWeekTextual_;
                case 'l':
                    return this.parseDayOfWeekTextualFull_;
                case 'n':
                case 'm':
                    return this.parseMonth_;
                case 'F':
                    return this.parseMonthTextual_;
                case 'M':
                    return this.parseMonthTextualShort_;
                case 'Y':
                    return this.parseYear_;
                case 'y':
                    return this.parseYearTwoDigits_;
                default:
                    return null;
            }
        };
        DateConverter_.prototype.parseDay_ = function (text, dateData) {
            var took = 0;
            while (text.substring(0, 1) === '0') {
                text = text.substring(1);
                took++;
            }
            var day = text.substring(0, 2);
            if (!/[12][0-9]|3[01]/.test(day)) {
                day = day.substring(0, 1);
                if (!/[1-9]/.test(day)) {
                    throw new CannotParseDateException();
                }
            }
            dateData.day = parseInt(day, 10);
            return took + day.length;
        };
        DateConverter_.prototype.parseDayOfWeekTextual_ = function (text) {
            var _this = this;
            return this.parseDayOfWeekByTranslator_(text, function (dayOfWeek) {
                return _this.options_.translator.translateDayOfWeek(dayOfWeek);
            });
        };
        DateConverter_.prototype.parseDayOfWeekTextualFull_ = function (text) {
            var _this = this;
            return this.parseDayOfWeekByTranslator_(text, function (dayOfWeek) {
                return _this.options_.translator.translateDayOfWeekFull(dayOfWeek);
            });
        };
        DateConverter_.prototype.parseDayOfWeekByTranslator_ = function (text, translate) {
            var maxLength = 0;
            var matchedTranslationLength = 0;
            for (var dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                var translation = translate(dayOfWeek);
                maxLength = Math.max(maxLength, translation.length);
                if (text.substring(0, translation.length).toLowerCase() === translation.toLowerCase()
                    && translation.length > matchedTranslationLength) {
                    matchedTranslationLength = translation.length;
                }
            }
            if (matchedTranslationLength > 0) {
                return matchedTranslationLength;
            }
            var took = 0;
            while (/[a-zA-Z]/.test(text.substring(0, 1))) {
                text = text.substring(1);
                took++;
                if (took === maxLength) {
                    break;
                }
            }
            return took;
        };
        DateConverter_.prototype.parseMonth_ = function (text, dateData) {
            var took = 0;
            while (text.substring(0, 1) === '0') {
                text = text.substring(1);
                took++;
            }
            var month = text.substring(0, 2);
            if (month !== '10' && month !== '11' && month !== '12') {
                month = month.substring(0, 1);
                if (!/[1-9]/.test(month)) {
                    throw new CannotParseDateException();
                }
            }
            dateData.month = parseInt(month, 10);
            return took + month.length;
        };
        DateConverter_.prototype.parseMonthTextual_ = function (text, dateData) {
            var _this = this;
            return this.parseMonthByTranslator_(text, dateData, function (month) {
                return _this.options_.translator.translateMonth(month);
            });
        };
        DateConverter_.prototype.parseMonthTextualShort_ = function (text, dateData) {
            var _this = this;
            return this.parseMonthByTranslator_(text, dateData, function (month) {
                return _this.options_.translator.translateMonthShort(month);
            });
        };
        DateConverter_.prototype.parseMonthByTranslator_ = function (text, dateData, translate) {
            var matchedMonth = null;
            var matchedTranslationLength = 0;
            for (var month = 1; month <= 12; month++) {
                var translation = translate(month - 1);
                if (text.substring(0, translation.length).toLowerCase() === translation.toLowerCase()
                    && translation.length > matchedTranslationLength) {
                    matchedMonth = month;
                    matchedTranslationLength = translation.length;
                }
            }
            if (matchedMonth === null) {
                throw new CannotParseDateException();
            }
            dateData.month = matchedMonth;
            return matchedTranslationLength;
        };
        DateConverter_.prototype.parseYear_ = function (text, dateData, minDate, maxDate) {
            var isNegative = false;
            if (text.substring(0, 1) === '-') {
                isNegative = true;
                text = text.substring(1);
            }
            var maxPositiveLength = maxDate.getFullYear() > 0 ? (maxDate.getFullYear() + '').length : 0;
            var maxNegativeLength = minDate.getFullYear() < 0 ? (-minDate.getFullYear() + '').length : 0;
            var yearLength = 0;
            while (/[0-9]/.test(text.substring(yearLength, yearLength + 1))) {
                if ((isNegative && yearLength + 1 > maxNegativeLength)
                    || (!isNegative && yearLength + 1 > maxPositiveLength)) {
                    break;
                }
                yearLength++;
            }
            if (yearLength === 0) {
                throw new CannotParseDateException();
            }
            var year = parseInt(text.substring(0, yearLength), 10);
            if (isNegative) {
                year = -year;
            }
            dateData.year = year;
            return yearLength + (isNegative ? 1 : 0);
        };
        DateConverter_.prototype.parseYearTwoDigits_ = function (text, dateData) {
            var yearEnd = text.substring(0, 2);
            if (!/[0-9]{2}/.test(yearEnd)) {
                throw new CannotParseDateException();
            }
            var currentYear = (this.options_.getToday()).getFullYear() + '';
            var yearBeginning = currentYear.substring(0, currentYear.length - 2);
            dateData.year = parseInt(yearBeginning + yearEnd, 10);
            return 2;
        };
        DateConverter_.prototype.getValidPhrases_ = function (type) {
            switch (type) {
                case 'j':
                case 'd':
                case 'n':
                case 'm':
                case 'Y':
                case 'y':
                    return [];
                case 'D':
                    return this.options_.translator.dayOfWeekTranslations_;
                case 'l':
                    return this.options_.translator.dayOfWeekFullTranslations_;
                case 'F':
                    return this.options_.translator.monthTranslations_;
                case 'M':
                    return this.options_.translator.monthShortTranslations_;
                default:
                    return null;
            }
        };
        return DateConverter_;
    }());
    TheDatepicker.DateConverter_ = DateConverter_;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var InitializationPhase;
    (function (InitializationPhase) {
        InitializationPhase[InitializationPhase["Untouched"] = 0] = "Untouched";
        InitializationPhase[InitializationPhase["Waiting"] = 1] = "Waiting";
        InitializationPhase[InitializationPhase["Ready"] = 2] = "Ready";
        InitializationPhase[InitializationPhase["Initialized"] = 3] = "Initialized";
        InitializationPhase[InitializationPhase["Destroyed"] = 4] = "Destroyed";
    })(InitializationPhase || (InitializationPhase = {}));
    var Datepicker = (function () {
        function Datepicker(input, container, options) {
            if (container === void 0) { container = null; }
            if (options === void 0) { options = null; }
            this.initializationPhase_ = InitializationPhase.Untouched;
            this.inputListenerRemover_ = null;
            this.listenerRemovers_ = [];
            this.deselectElement_ = null;
            if (input && !TheDatepicker.Helper_.isElement_(input)) {
                throw new Error('Input was expected to be null or an HTMLElement.');
            }
            if (container && !TheDatepicker.Helper_.isElement_(container)) {
                throw new Error('Container was expected to be null or an HTMLElement.');
            }
            if (!input && !container) {
                throw new Error('At least one of input or container is mandatory.');
            }
            if (options && !(options instanceof TheDatepicker.Options)) {
                throw new Error('Options was expected to be an instance of Options');
            }
            Datepicker.document_ = document;
            this.options = options ? options.clone() : new TheDatepicker.Options();
            var duplicateError = 'There is already a datepicker present on ';
            this.isContainerExternal_ = !!container;
            if (!container) {
                container = this.createContainer_();
                if (input) {
                    input.parentNode.insertBefore(container, input.nextSibling);
                }
            }
            else {
                if (container.datepicker) {
                    throw new Error(duplicateError + 'container.');
                }
            }
            if (input) {
                if (input.datepicker) {
                    throw new Error(duplicateError + 'input.');
                }
                input.datepicker = this;
            }
            this.isInputTextBox_ = input
                && (typeof HTMLInputElement !== 'undefined' ? input instanceof HTMLInputElement : true)
                && input.type === 'text';
            if (this.isInputTextBox_) {
                input.autocomplete = 'off';
            }
            container.datepicker = this;
            this.input = input;
            this.container = container;
            this.dateConverter_ = new TheDatepicker.DateConverter_(this.options);
            this.viewModel_ = new TheDatepicker.ViewModel_(this.options, this, this.dateConverter_);
            this.triggerReady_(input);
            this.triggerReady_(container);
        }
        Datepicker.prototype.render = function () {
            var _this = this;
            switch (this.initializationPhase_) {
                case InitializationPhase.Ready:
                    this.initListeners_();
                    this.initializationPhase_ = InitializationPhase.Initialized;
                    this.render();
                    return;
                case InitializationPhase.Waiting:
                    this.createDeselectElement_();
                    if (!this.options.isHiddenOnBlur()) {
                        this.open();
                        return;
                    }
                    if (!this.viewModel_.selectPossibleDate_()) {
                        this.updateInput_();
                    }
                    return;
                case InitializationPhase.Untouched:
                    this.preselectFromInput_();
                    this.createDeselectElement_();
                    if (!this.viewModel_.selectInitialDate_(null)) {
                        this.updateInput_();
                    }
                    if (this.input && this.options.isHiddenOnBlur()) {
                        if (this.input === Datepicker.document_.activeElement) {
                            this.initializationPhase_ = InitializationPhase.Ready;
                            this.render();
                            this.open();
                            return;
                        }
                        this.inputListenerRemover_ = TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.Focus, function (event) {
                            _this.open(event);
                        });
                        this.initializationPhase_ = InitializationPhase.Waiting;
                        return;
                    }
                    this.initializationPhase_ = InitializationPhase.Ready;
                    this.render();
                    return;
                default:
                    this.viewModel_.render_();
                    return;
            }
        };
        Datepicker.prototype.open = function (event) {
            if (event === void 0) { event = null; }
            if (this.initializationPhase_ === InitializationPhase.Untouched) {
                this.render();
            }
            if (this.initializationPhase_ === InitializationPhase.Waiting) {
                this.initializationPhase_ = InitializationPhase.Ready;
                this.render();
                Datepicker.hasClickedViewModel_ = true;
            }
            if (!Datepicker.activateViewModel_(event, this)) {
                return false;
            }
            if (this.input) {
                this.input.focus();
            }
            return true;
        };
        Datepicker.prototype.isOpened = function () {
            return this.viewModel_.isActive_();
        };
        Datepicker.prototype.close = function (event) {
            if (event === void 0) { event = null; }
            if (!this.viewModel_.isActive_()) {
                return true;
            }
            if (!Datepicker.activateViewModel_(event, null)) {
                return false;
            }
            if (this.input) {
                this.input.blur();
            }
            return true;
        };
        Datepicker.prototype.reset = function (event) {
            if (event === void 0) { event = null; }
            return this.viewModel_.reset_(event);
        };
        Datepicker.prototype.destroy = function () {
            if (this.initializationPhase_ === InitializationPhase.Destroyed) {
                return;
            }
            for (var index = 0; index < this.listenerRemovers_.length; index++) {
                this.listenerRemovers_[index]();
            }
            this.listenerRemovers_ = [];
            if (this.isContainerExternal_) {
                this.container.innerHTML = '';
            }
            else {
                this.container.parentNode.removeChild(this.container);
            }
            delete this.container.datepicker;
            if (this.input) {
                delete this.input.datepicker;
                this.removeInitialInputListener_();
                this.input = null;
            }
            if (this.deselectElement_) {
                this.deselectElement_.parentNode.removeChild(this.deselectElement_);
                this.deselectElement_ = null;
            }
            this.initializationPhase_ = InitializationPhase.Destroyed;
        };
        Datepicker.prototype.isDestroyed = function () {
            return this.initializationPhase_ === InitializationPhase.Destroyed;
        };
        Datepicker.prototype.selectDate = function (date, doUpdateMonth, event) {
            if (doUpdateMonth === void 0) { doUpdateMonth = true; }
            if (event === void 0) { event = null; }
            return this.viewModel_.selectDay_(event, TheDatepicker.Helper_.normalizeDate_('Date', date, true, this.options), !!doUpdateMonth);
        };
        Datepicker.prototype.getSelectedDate = function () {
            return this.viewModel_.selectedDate_ ? new Date(this.viewModel_.selectedDate_.getTime()) : null;
        };
        Datepicker.prototype.getSelectedDateFormatted = function () {
            return this.dateConverter_.formatDate_(this.options.getInputFormat(), this.viewModel_.selectedDate_);
        };
        Datepicker.prototype.getCurrentMonth = function () {
            return new Date(this.viewModel_.getCurrentMonth_().getTime());
        };
        Datepicker.prototype.goToMonth = function (month, event) {
            if (event === void 0) { event = null; }
            return this.viewModel_.goToMonth_(event, TheDatepicker.Helper_.normalizeDate_('Month', month, false, this.options));
        };
        Datepicker.prototype.parseRawInput = function () {
            return this.isInputTextBox_
                ? this.dateConverter_.parseDate_(this.options.getInputFormat(), this.input.value, this.options.getMinDate_(), this.options.getMaxDate_())
                : null;
        };
        Datepicker.prototype.getDay = function (date) {
            return this.viewModel_.createDay_(TheDatepicker.Helper_.normalizeDate_('Date', date, false, this.options));
        };
        Datepicker.prototype.canType_ = function (char) {
            if (!this.isInputTextBox_ || this.options.isAllowedInputAnyChar()) {
                return true;
            }
            return this.dateConverter_.isValidChar_(this.options.getInputFormat(), char);
        };
        Datepicker.prototype.readInput_ = function (event) {
            if (event === void 0) { event = null; }
            if (!this.isInputTextBox_) {
                return false;
            }
            try {
                var date = this.parseRawInput();
                return date
                    ? this.viewModel_.selectNearestDate_(event, date)
                    : this.viewModel_.cancelSelection_(event);
            }
            catch (error) {
                if (!(error instanceof TheDatepicker.CannotParseDateException)) {
                    throw error;
                }
                return false;
            }
        };
        Datepicker.prototype.updateInput_ = function () {
            if (!this.isInputTextBox_ || this.input === Datepicker.document_.activeElement) {
                return;
            }
            this.input.value = this.dateConverter_.formatDate_(this.options.getInputFormat(), this.viewModel_.selectedDate_) || '';
            if (this.deselectElement_) {
                var isVisible = this.options.isDeselectButtonShown() && this.input.value !== '';
                this.deselectElement_.style.visibility = isVisible ? 'visible' : 'hidden';
            }
        };
        Datepicker.onDatepickerReady = function (element, callback) {
            if (callback === void 0) { callback = null; }
            if (!TheDatepicker.Helper_.isElement_(element)) {
                throw new Error('Element was expected to be an HTMLElement.');
            }
            callback = TheDatepicker.Helper_.checkFunction_('Callback', callback);
            var promise = null;
            var promiseResolve = null;
            if (typeof Promise !== 'undefined') {
                promise = new Promise(function (resolve) {
                    promiseResolve = resolve;
                });
            }
            if (element.datepicker && element.datepicker instanceof Datepicker) {
                element.datepicker.triggerReadyListener_(callback, element);
                if (promiseResolve) {
                    promiseResolve(element.datepicker);
                }
            }
            else {
                Datepicker.readyListeners_.push({
                    promiseResolve: promiseResolve,
                    element: element,
                    callback: callback
                });
            }
            return promise;
        };
        ;
        Datepicker.prototype.createContainer_ = function () {
            var container = TheDatepicker.HtmlHelper_.createDiv_('container', this.options);
            if (this.options.isFullScreenOnMobile()) {
                TheDatepicker.HtmlHelper_.addClass_(container, 'container--responsive', this.options);
            }
            return container;
        };
        Datepicker.prototype.createDeselectElement_ = function () {
            var _this = this;
            if (!this.isInputTextBox_ || !this.options.isDeselectButtonShown() || this.deselectElement_) {
                return null;
            }
            var deselectButton = TheDatepicker.HtmlHelper_.createAnchor_(function (event) {
                deselectButton.focus();
                _this.viewModel_.cancelSelection_(event);
            }, this.options, 'deselect-button');
            deselectButton.innerHTML = this.options.getDeselectHtml();
            var title = this.options.translator.translateTitle(TheDatepicker.TitleName.Deselect);
            if (title !== '') {
                deselectButton.title = title;
            }
            var deselectElement = TheDatepicker.HtmlHelper_.createSpan_();
            TheDatepicker.HtmlHelper_.addClass_(deselectElement, 'deselect', this.options);
            deselectElement.appendChild(deselectButton);
            this.input.parentNode.insertBefore(deselectElement, this.input.nextSibling);
            this.deselectElement_ = deselectElement;
        };
        Datepicker.prototype.preselectFromInput_ = function () {
            if (this.isInputTextBox_) {
                try {
                    var date = this.parseRawInput();
                    if (date) {
                        this.options.setInitialDate(date);
                    }
                }
                catch (error) {
                    if (!(error instanceof TheDatepicker.CannotParseDateException)) {
                        throw error;
                    }
                }
            }
        };
        Datepicker.prototype.initListeners_ = function () {
            var _this = this;
            if (!Datepicker.areGlobalListenersInitialized_) {
                var activeViewModel = null;
                var checkMiss = function (event) {
                    if (Datepicker.hasClickedViewModel_) {
                        Datepicker.hasClickedViewModel_ = false;
                    }
                    else {
                        Datepicker.activateViewModel_(event, null);
                    }
                };
                TheDatepicker.Helper_.addEventListener_(Datepicker.document_, TheDatepicker.ListenerType_.MouseDown, checkMiss);
                TheDatepicker.Helper_.addEventListener_(Datepicker.document_, TheDatepicker.ListenerType_.FocusIn, checkMiss);
                TheDatepicker.Helper_.addEventListener_(Datepicker.document_, TheDatepicker.ListenerType_.KeyDown, function (event) {
                    if (Datepicker.activeViewModel_) {
                        Datepicker.activeViewModel_.triggerKeyPress_(event);
                    }
                });
                Datepicker.areGlobalListenersInitialized_ = true;
            }
            this.removeInitialInputListener_();
            var hit = function (event) {
                Datepicker.activateViewModel_(event, _this);
                Datepicker.hasClickedViewModel_ = true;
            };
            this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.container, TheDatepicker.ListenerType_.MouseDown, hit));
            this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.container, TheDatepicker.ListenerType_.FocusIn, hit));
            if (this.deselectElement_) {
                var hitIfActive = function (event) {
                    if (_this.viewModel_.isActive_()) {
                        hit(event);
                    }
                };
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.deselectElement_, TheDatepicker.ListenerType_.MouseDown, hitIfActive));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.deselectElement_, TheDatepicker.ListenerType_.FocusIn, hitIfActive));
            }
            if (this.input) {
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.MouseDown, hit));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.Focus, hit));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.Blur, function () {
                    _this.updateInput_();
                }));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.KeyDown, function (event) {
                    TheDatepicker.Helper_.stopPropagation_(event);
                    if (event.keyCode === TheDatepicker.KeyCode_.Esc && _this.options.isClosedOnEscPress()) {
                        _this.close(event);
                    }
                }));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.KeyUp, function (event) {
                    _this.readInput_(event);
                }));
                this.listenerRemovers_.push(TheDatepicker.Helper_.addEventListener_(this.input, TheDatepicker.ListenerType_.KeyPress, function (event) {
                    var charCode = event.charCode || event.keyCode;
                    if (charCode && !_this.canType_(String.fromCharCode(charCode))) {
                        TheDatepicker.Helper_.preventDefault_(event);
                    }
                }));
            }
        };
        Datepicker.prototype.removeInitialInputListener_ = function () {
            if (this.inputListenerRemover_) {
                this.inputListenerRemover_();
                this.inputListenerRemover_ = null;
            }
        };
        Datepicker.prototype.triggerReady_ = function (element) {
            for (var index = Datepicker.readyListeners_.length - 1; index >= 0; index--) {
                var listener = Datepicker.readyListeners_[index];
                if (listener.element === element) {
                    this.triggerReadyListener_(listener.callback, element);
                    if (listener.promiseResolve) {
                        listener.promiseResolve(this);
                    }
                    Datepicker.readyListeners_.splice(index, 1);
                }
            }
        };
        Datepicker.prototype.triggerReadyListener_ = function (callback, element) {
            if (callback) {
                callback.call(element, this, element);
            }
        };
        Datepicker.prototype.onActivate_ = function () {
            if (this.initializationPhase_ === InitializationPhase.Destroyed) {
                return;
            }
            this.updateContainer_();
            if (!this.options.isKeyboardOnMobile() && this.isInputTextBox_) {
                this.input.readOnly = TheDatepicker.Helper_.isMobile_();
            }
        };
        Datepicker.prototype.updateContainer_ = function () {
            if (this.isContainerExternal_) {
                return;
            }
            var windowTop = window.pageYOffset || Datepicker.document_.documentElement.scrollTop;
            var windowLeft = window.pageXOffset || Datepicker.document_.documentElement.scrollLeft;
            var viewportHeight = null;
            var viewportWidth = null;
            if (window.visualViewport) {
                viewportHeight = window.visualViewport.height;
                viewportWidth = window.visualViewport.width;
            }
            var windowHeight = viewportHeight || window.innerHeight || Math.max(Datepicker.document_.documentElement.clientHeight, Datepicker.document_.body.clientHeight) || 0;
            var windowWidth = viewportWidth || window.innerWidth || Math.max(Datepicker.document_.documentElement.clientWidth, Datepicker.document_.body.clientWidth) || 0;
            var windowBottom = windowTop + windowHeight;
            var windowRight = windowLeft + windowWidth;
            var inputTop = 0;
            var inputLeft = 0;
            var parentElement = this.input;
            while (parentElement && !isNaN(parentElement.offsetLeft) && !isNaN(parentElement.offsetTop)) {
                inputTop += parentElement.offsetTop - (parentElement.scrollTop || 0);
                inputLeft += parentElement.offsetLeft - (parentElement.scrollLeft || 0);
                parentElement = parentElement.offsetParent;
            }
            var mainElement = null;
            if (this.options.isPositionFixingEnabled() && this.container.childNodes.length > 0) {
                mainElement = this.container.childNodes[0];
                mainElement.style.position = '';
                mainElement.style.top = '';
                mainElement.style.left = '';
            }
            var inputWidth = this.input.offsetWidth;
            var inputHeight = this.input.offsetHeight;
            var inputBottom = inputTop + inputHeight;
            var inputRight = inputLeft + inputWidth;
            var containerHeight = this.container.offsetHeight;
            var containerWidth = this.container.offsetWidth;
            this.container.className = '';
            TheDatepicker.HtmlHelper_.addClass_(this.container, 'container', this.options);
            var locateOver = inputTop - windowTop > containerHeight && windowBottom - inputBottom < containerHeight;
            var locateLeft = inputLeft - windowLeft > containerWidth - inputWidth && windowRight - inputRight < containerWidth - inputWidth;
            if (locateOver) {
                TheDatepicker.HtmlHelper_.addClass_(this.container, 'container--over', this.options);
            }
            if (locateLeft) {
                TheDatepicker.HtmlHelper_.addClass_(this.container, 'container--left', this.options);
            }
            if (this.options.isFullScreenOnMobile()) {
                TheDatepicker.HtmlHelper_.addClass_(this.container, 'container--responsive', this.options);
            }
            if (mainElement && (locateOver || locateLeft)) {
                if (locateOver) {
                    var moveTop = inputHeight + containerHeight;
                    mainElement.style.top = '-' + moveTop + 'px';
                }
                if (locateLeft) {
                    var moveLeft = containerWidth - inputWidth;
                    mainElement.style.left = '-' + moveLeft + 'px';
                }
                mainElement.style.position = 'absolute';
            }
        };
        Datepicker.setBodyClass_ = function (enable) {
            var pageClass = 'the-datepicker-page';
            var body = Datepicker.document_.body;
            var className = body.className;
            var hasClass = className.indexOf(pageClass) > -1;
            if (!hasClass && enable) {
                body.className += (className.length > 0 ? ' ' : '') + pageClass;
            }
            else if (hasClass && !enable) {
                var search = pageClass;
                if (className.indexOf(' ' + pageClass) > -1) {
                    search = ' ' + pageClass;
                }
                else if (className.indexOf(pageClass + ' ') > -1) {
                    search = pageClass + ' ';
                }
                body.className = className.replace(search, '');
            }
        };
        Datepicker.activateViewModel_ = function (event, datepicker) {
            var viewModel = datepicker ? datepicker.viewModel_ : null;
            var activeViewModel = Datepicker.activeViewModel_;
            if (activeViewModel === viewModel) {
                return true;
            }
            if (activeViewModel && !activeViewModel.setActive_(event, false)) {
                return false;
            }
            if (Datepicker.activeViewModel_ !== activeViewModel) {
                return true;
            }
            if (!viewModel) {
                Datepicker.setBodyClass_(false);
                Datepicker.activeViewModel_ = null;
                return true;
            }
            if (!viewModel.setActive_(event, true)) {
                return false;
            }
            if (Datepicker.activeViewModel_ !== activeViewModel) {
                return true;
            }
            datepicker.onActivate_();
            Datepicker.setBodyClass_(!datepicker.isContainerExternal_ && datepicker.options.isFullScreenOnMobile());
            Datepicker.activeViewModel_ = viewModel;
            return true;
        };
        Datepicker.readyListeners_ = [];
        Datepicker.areGlobalListenersInitialized_ = false;
        Datepicker.activeViewModel_ = null;
        Datepicker.hasClickedViewModel_ = false;
        return Datepicker;
    }());
    TheDatepicker.Datepicker = Datepicker;
    TheDatepicker.onDatepickerReady = Datepicker.onDatepickerReady;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var Day = (function () {
        function Day(date, createDay, formatDate) {
            this.isToday = false;
            this.isPast = false;
            this.isAvailable = true;
            this.isInValidity = true;
            this.isVisible = false;
            this.isInCurrentMonth = false;
            this.isSelected = false;
            this.isHighlighted = false;
            this.isFocused = false;
            this.dayNumber = date.getDate();
            this.month = date.getMonth() + 1;
            this.year = date.getFullYear();
            this.dayOfWeek = date.getDay();
            this.isWeekend = this.dayOfWeek === TheDatepicker.DayOfWeek.Saturday || this.dayOfWeek === TheDatepicker.DayOfWeek.Sunday;
            this.createDay_ = createDay;
            this.formatDate_ = formatDate;
        }
        Day.prototype.getDate = function () {
            return new Date(this.year, this.month - 1, this.dayNumber, 0, 0, 0, 0);
        };
        Day.prototype.getFormatted = function () {
            return this.year + '-' + ('0' + this.month).slice(-2) + '-' + ('0' + this.dayNumber).slice(-2);
        };
        Day.prototype.getInputFormatted = function () {
            return this.formatDate_(this.getDate());
        };
        Day.prototype.isEqualToDate = function (date) {
            return TheDatepicker.Helper_.isValidDate_(date)
                && this.dayNumber === date.getDate()
                && this.month === date.getMonth() + 1
                && this.year === date.getFullYear();
        };
        Day.prototype.isEqualToDay = function (day) {
            return day instanceof Day
                && this.dayNumber === day.dayNumber
                && this.month === day.month
                && this.year === day.year;
        };
        Day.prototype.getSibling = function (shift) {
            if (shift === void 0) { shift = 1; }
            var date = this.getDate();
            date.setDate(date.getDate() + TheDatepicker.Helper_.checkNumber_('Shift', shift));
            return this.createDay_(date);
        };
        return Day;
    }());
    TheDatepicker.Day = Day;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var DayOfWeek;
    (function (DayOfWeek) {
        DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
        DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
        DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
        DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
        DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
        DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
        DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
    })(DayOfWeek = TheDatepicker.DayOfWeek || (TheDatepicker.DayOfWeek = {}));
    var Month;
    (function (Month) {
        Month[Month["January"] = 0] = "January";
        Month[Month["February"] = 1] = "February";
        Month[Month["March"] = 2] = "March";
        Month[Month["April"] = 3] = "April";
        Month[Month["May"] = 4] = "May";
        Month[Month["June"] = 5] = "June";
        Month[Month["July"] = 6] = "July";
        Month[Month["August"] = 7] = "August";
        Month[Month["September"] = 8] = "September";
        Month[Month["October"] = 9] = "October";
        Month[Month["November"] = 10] = "November";
        Month[Month["December"] = 11] = "December";
    })(Month = TheDatepicker.Month || (TheDatepicker.Month = {}));
    var KeyCode_;
    (function (KeyCode_) {
        KeyCode_[KeyCode_["Enter"] = 13] = "Enter";
        KeyCode_[KeyCode_["Space"] = 32] = "Space";
        KeyCode_[KeyCode_["Left"] = 37] = "Left";
        KeyCode_[KeyCode_["Up"] = 38] = "Up";
        KeyCode_[KeyCode_["Right"] = 39] = "Right";
        KeyCode_[KeyCode_["Down"] = 40] = "Down";
        KeyCode_[KeyCode_["Esc"] = 27] = "Esc";
    })(KeyCode_ = TheDatepicker.KeyCode_ || (TheDatepicker.KeyCode_ = {}));
    var ListenerType_;
    (function (ListenerType_) {
        ListenerType_["MouseDown"] = "mousedown";
        ListenerType_["Focus"] = "focus";
        ListenerType_["FocusIn"] = "focusin";
        ListenerType_["Blur"] = "blur";
        ListenerType_["KeyDown"] = "keydown";
        ListenerType_["KeyUp"] = "keyup";
        ListenerType_["KeyPress"] = "keypress";
        ListenerType_["TouchStart"] = "touchstart";
        ListenerType_["TouchMove"] = "touchmove";
        ListenerType_["AnimationEnd"] = "animationend";
    })(ListenerType_ = TheDatepicker.ListenerType_ || (TheDatepicker.ListenerType_ = {}));
    var Helper_ = (function () {
        function Helper_() {
        }
        Helper_.resetTime_ = function (date) {
            if (!date) {
                return null;
            }
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        };
        Helper_.normalizeDate_ = function (parameterName, value, isNullable, options) {
            if (!value) {
                if (!isNullable) {
                    throw new Error(parameterName + ' cannot be empty.');
                }
                return null;
            }
            if (value instanceof TheDatepicker.Day) {
                return value.getDate();
            }
            if (typeof value === 'string') {
                if (value === 'today' || value === 'now') {
                    return options.getToday();
                }
                if (value === 'tomorrow') {
                    var date_1 = options.getToday();
                    date_1.setDate(date_1.getDate() + 1);
                    return date_1;
                }
                if (value === 'yesterday') {
                    var date_2 = options.getToday();
                    date_2.setDate(date_2.getDate() - 1);
                    return date_2;
                }
                var matches = value.match(/^\s*([+-]?)\s*([0-9]+)\s*(day|month|year)s?\s*$/i);
                if (matches) {
                    var date_3 = options.getToday();
                    var amount = parseInt(matches[2], 10) * (matches[1] === '-' ? -1 : 1);
                    switch (matches[3].toLowerCase()) {
                        case 'day':
                        case 'days':
                            date_3.setDate(date_3.getDate() + amount);
                            break;
                        case 'month':
                        case 'months':
                            date_3.setMonth(date_3.getMonth() + amount);
                            break;
                        case 'year':
                        case 'years':
                            date_3.setFullYear(date_3.getFullYear() + amount);
                            break;
                    }
                    return date_3;
                }
                var date = Helper_.resetTime_(new Date(value));
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            else if (Helper_.isValidDate_(value)) {
                var date = Helper_.resetTime_(new Date(value.getTime()));
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            throw new Error(parameterName
                + ' was expected to be a valid Date string or valid Date or TheDatepicker.Day'
                + (isNullable ? ' or null.' : '.'));
        };
        Helper_.isElement_ = function (element) {
            return typeof element === 'object'
                && element.nodeType === 1
                && typeof element.style === 'object'
                && typeof element.ownerDocument === 'object';
        };
        Helper_.isValidDate_ = function (value) {
            return typeof value === 'object'
                && Object.prototype.toString.call(value) === '[object Date]'
                && !isNaN(value.getTime());
        };
        Helper_.inArray_ = function (list, item) {
            for (var index = 0; index < list.length; index++) {
                if (list[index] === item) {
                    return true;
                }
            }
            return false;
        };
        Helper_.addEventListener_ = function (element, listenerType, listener, isPassive) {
            if (isPassive === void 0) { isPassive = false; }
            if (element.addEventListener) {
                var options = void 0;
                if (isPassive && Helper_.isPassiveEventListenerSupported_()) {
                    options = {
                        passive: true
                    };
                }
                element.addEventListener(listenerType, listener, options);
                return function () {
                    element.removeEventListener(listenerType, listener);
                };
            }
            var listenerProperty = 'on' + listenerType;
            var originalListener = element[listenerProperty] || null;
            element[listenerProperty] = function (event) {
                event = event || window.event;
                if (originalListener) {
                    originalListener.call(element, event);
                }
                listener(event);
            };
            return function () {
                element[listenerProperty] = originalListener;
            };
        };
        Helper_.preventDefault_ = function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            else {
                event.returnValue = false;
            }
        };
        Helper_.stopPropagation_ = function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            else {
                event.cancelBubble = true;
            }
        };
        Helper_.checkString_ = function (parameterName, value, checkNonEmpty) {
            if (checkNonEmpty === void 0) { checkNonEmpty = false; }
            if (!checkNonEmpty && !value) {
                return '';
            }
            if (typeof value !== 'string' || (checkNonEmpty && value === '')) {
                throw new Error(parameterName + ' was expected to be a' + (checkNonEmpty ? ' non empty' : '') + ' string.');
            }
            return value;
        };
        Helper_.checkNumber_ = function (parameterName, value, min, max) {
            if (min === void 0) { min = null; }
            if (max === void 0) { max = null; }
            value = typeof value === 'string' ? parseInt(value) : value;
            if (typeof value !== 'number' || isNaN(value) || (min !== null && value < min) || (max !== null && value > max)) {
                throw new Error(parameterName + ' was expected to be a valid number' + (min !== null ? ' from ' + min : '') + (max !== null ? ' to ' + max : '') + '.');
            }
            return value;
        };
        Helper_.checkFunction_ = function (parameterName, value, isNullable) {
            if (isNullable === void 0) { isNullable = true; }
            if (isNullable && !value) {
                return null;
            }
            if (typeof value !== 'function') {
                throw new Error(parameterName + ' was expected to be a function' + (isNullable ? ' or null' : '') + '.');
            }
            return value;
        };
        Helper_.warnDeprecatedUsage_ = function (deprecatedMethod, alternateMethods) {
            if (!window.console) {
                return;
            }
            for (var index = 0; index < Helper_.deprecatedMethods_.length; index++) {
                if (deprecatedMethod === Helper_.deprecatedMethods_[0]) {
                    return;
                }
            }
            for (var index = 0; index < alternateMethods.length; index++) {
                alternateMethods[index] += '()';
            }
            window.console.warn('TheDatepicker: ' + deprecatedMethod + '() is deprecated, use ' + alternateMethods.join(' or '));
            Helper_.deprecatedMethods_.push(deprecatedMethod);
        };
        Helper_.addSwipeListener_ = function (element, listener) {
            var startPosition = null;
            var minDistance = null;
            Helper_.addEventListener_(element, ListenerType_.TouchStart, function (event) {
                startPosition = event.touches[0].clientX;
                minDistance = element.offsetWidth / 5;
            }, true);
            Helper_.addEventListener_(element, ListenerType_.TouchMove, function (event) {
                if (startPosition === null) {
                    return;
                }
                var diff = event.touches[0].clientX - startPosition;
                if (Math.abs(diff) > minDistance) {
                    listener(event, diff > 0);
                    startPosition = null;
                }
            }, true);
        };
        Helper_.isCssAnimationSupported_ = function () {
            if (Helper_.cssAnimationSupport_ === null) {
                var fakeElement = document.createElement('div');
                Helper_.cssAnimationSupport_ = fakeElement.style.animationName === '';
            }
            return Helper_.cssAnimationSupport_;
        };
        Helper_.isPassiveEventListenerSupported_ = function () {
            if (Helper_.passiveEventListenerSupport_ === null) {
                var isSupported_1 = false;
                try {
                    var options = Object.defineProperty({}, 'passive', {
                        get: function () {
                            isSupported_1 = true;
                            return false;
                        }
                    });
                    window.addEventListener('test', null, options);
                    window.removeEventListener('test', null, options);
                }
                catch (error) { }
                Helper_.passiveEventListenerSupport_ = isSupported_1;
            }
            return Helper_.passiveEventListenerSupport_;
        };
        Helper_.isMobile_ = function () {
            var matchMedia = window.matchMedia || window.msMatchMedia;
            var mediaQuery = 'only all and (max-width: 37.5em)';
            if (!matchMedia) {
                return false;
            }
            var result = matchMedia(mediaQuery);
            if (!result) {
                return false;
            }
            return !!result.matches;
        };
        Helper_.deprecatedMethods_ = [];
        Helper_.cssAnimationSupport_ = null;
        Helper_.passiveEventListenerSupport_ = null;
        return Helper_;
    }());
    TheDatepicker.Helper_ = Helper_;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var HtmlHelper_ = (function () {
        function HtmlHelper_() {
        }
        HtmlHelper_.createDiv_ = function (className, options) {
            var div = document.createElement('div');
            this.addClass_(div, className, options);
            return div;
        };
        HtmlHelper_.createAnchor_ = function (onClick, options, className) {
            if (className === void 0) { className = 'button'; }
            var anchor = document.createElement('a');
            this.addClass_(anchor, className, options);
            anchor.href = '#';
            anchor.onclick = function (event) {
                event = event || window.event;
                TheDatepicker.Helper_.preventDefault_(event);
                onClick(event);
            };
            anchor.onkeydown = function (event) {
                event = event || window.event;
                if (TheDatepicker.Helper_.inArray_([TheDatepicker.KeyCode_.Enter, TheDatepicker.KeyCode_.Space], event.keyCode)) {
                    TheDatepicker.Helper_.preventDefault_(event);
                    onClick(event);
                }
            };
            return anchor;
        };
        HtmlHelper_.createSpan_ = function () {
            return document.createElement('span');
        };
        HtmlHelper_.createTable_ = function (className, header, body, options) {
            var table = document.createElement('table');
            this.addClass_(table, className, options);
            table.appendChild(header);
            table.appendChild(body);
            return table;
        };
        HtmlHelper_.createTableHeader_ = function (className, cells, options) {
            var tableHeader = document.createElement('thead');
            this.addClass_(tableHeader, className, options);
            var row = document.createElement('tr');
            for (var index = 0; index < cells.length; index++) {
                row.appendChild(cells[index]);
            }
            tableHeader.appendChild(row);
            return tableHeader;
        };
        HtmlHelper_.createTableHeaderCell_ = function (className, options) {
            var cell = document.createElement('th');
            cell.scope = 'col';
            this.addClass_(cell, className, options);
            return cell;
        };
        HtmlHelper_.createTableBody_ = function (className, rows, options) {
            var tableBody = document.createElement('tbody');
            this.addClass_(tableBody, className, options);
            for (var index = 0; index < rows.length; index++) {
                tableBody.appendChild(rows[index]);
            }
            return tableBody;
        };
        HtmlHelper_.createTableRow_ = function (className, cells) {
            var row = document.createElement('tr');
            for (var index = 0; index < cells.length; index++) {
                row.appendChild(cells[index]);
            }
            return row;
        };
        HtmlHelper_.createTableCell_ = function () {
            return document.createElement('td');
        };
        HtmlHelper_.createSelectInput_ = function (selectOptions, onChange, options) {
            var input = document.createElement('select');
            this.addClass_(input, 'select', options);
            for (var index = 0; index < selectOptions.length; index++) {
                input.appendChild(this.createSelectOption_(selectOptions[index].value, selectOptions[index].label));
            }
            input.onchange = function (event) {
                onChange(event || window.event, input.value);
            };
            input.onkeydown = function (event) {
                event = event || window.event;
                TheDatepicker.Helper_.stopPropagation_(event);
            };
            return input;
        };
        HtmlHelper_.createSelectOption_ = function (value, label) {
            var option = document.createElement('option');
            option.value = value;
            option.innerText = label;
            return option;
        };
        HtmlHelper_.addClass_ = function (element, className, options) {
            className = options.prefixClass_(className);
            if (element.className !== '') {
                className = ' ' + className;
            }
            element.className += className;
        };
        HtmlHelper_.appendChild_ = function (element, child) {
            if (child) {
                element.appendChild(child);
            }
        };
        return HtmlHelper_;
    }());
    TheDatepicker.HtmlHelper_ = HtmlHelper_;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var EventType_;
    (function (EventType_) {
        EventType_["BeforeSelect"] = "beforeSelect";
        EventType_["Select"] = "select";
        EventType_["BeforeOpen"] = "beforeOpen";
        EventType_["Open"] = "open";
        EventType_["BeforeClose"] = "beforeClose";
        EventType_["Close"] = "close";
        EventType_["BeforeMonthChange"] = "beforeMonthChange";
        EventType_["MonthChange"] = "monthChange";
        EventType_["Focus"] = "focus";
        EventType_["BeforeFocus"] = "beforeFocus";
    })(EventType_ = TheDatepicker.EventType_ || (TheDatepicker.EventType_ = {}));
    var AvailableDateNotFoundException = (function () {
        function AvailableDateNotFoundException() {
        }
        return AvailableDateNotFoundException;
    }());
    TheDatepicker.AvailableDateNotFoundException = AvailableDateNotFoundException;
    var Options = (function () {
        function Options(translator) {
            if (translator === void 0) { translator = null; }
            this.hideOnBlur_ = true;
            this.hideOnSelect_ = true;
            this.minDate_ = null;
            this.maxDate_ = null;
            this.initialDate_ = null;
            this.initialMonth_ = null;
            this.initialDatePriority_ = true;
            this.firstDayOfWeek_ = TheDatepicker.DayOfWeek.Monday;
            this.dateAvailabilityResolvers_ = [];
            this.cellContentResolver_ = null;
            this.cellContentStructureResolver_ = null;
            this.headerStructureResolver_ = null;
            this.footerStructureResolver_ = null;
            this.cellClassesResolvers_ = [];
            this.dayModifiers_ = [];
            this.inputFormat_ = 'j. n. Y';
            this.allowInputAnyChar_ = false;
            this.daysOutOfMonthVisible_ = false;
            this.fixedRowsCount_ = false;
            this.toggleSelection_ = false;
            this.allowEmpty_ = true;
            this.showDeselectButton_ = true;
            this.showResetButton_ = false;
            this.monthAsDropdown_ = true;
            this.yearAsDropdown_ = true;
            this.monthAndYearSeparated_ = true;
            this.monthShort_ = false;
            this.changeMonthOnSwipe_ = true;
            this.animateMonthChange_ = true;
            this.classesPrefix_ = 'the-datepicker__';
            this.showCloseButton_ = true;
            this.closeOnEscPress_ = true;
            this.title_ = '';
            this.dropdownItemsLimit_ = 200;
            this.hideDropdownWithOneItem_ = true;
            this.goBackHtml_ = '&lt;';
            this.goForwardHtml_ = '&gt;';
            this.closeHtml_ = '&times;';
            this.resetHtml_ = '&olarr;';
            this.deselectHtml_ = '&times;';
            this.positionFixing_ = true;
            this.fullScreenOnMobile_ = true;
            this.keyboardOnMobile_ = false;
            this.includeAria_ = true;
            this.today_ = null;
            this.listeners_ = {
                beforeSelect: [],
                select: [],
                beforeOpen: [],
                open: [],
                beforeClose: [],
                close: [],
                beforeMonthChange: [],
                monthChange: [],
                beforeFocus: [],
                focus: []
            };
            this.translator = translator || new TheDatepicker.Translator();
        }
        Options.prototype.clone = function () {
            var options = new Options(this.translator);
            options.hideOnBlur_ = this.hideOnBlur_;
            options.hideOnSelect_ = this.hideOnSelect_;
            options.minDate_ = this.minDate_;
            options.maxDate_ = this.maxDate_;
            options.initialDate_ = this.initialDate_;
            options.initialMonth_ = this.initialMonth_;
            options.initialDatePriority_ = this.initialDatePriority_;
            options.firstDayOfWeek_ = this.firstDayOfWeek_;
            options.dateAvailabilityResolvers_ = this.dateAvailabilityResolvers_.slice(0);
            options.cellContentResolver_ = this.cellContentResolver_;
            options.cellContentStructureResolver_ = this.cellContentStructureResolver_;
            options.headerStructureResolver_ = this.headerStructureResolver_;
            options.footerStructureResolver_ = this.footerStructureResolver_;
            options.cellClassesResolvers_ = this.cellClassesResolvers_.slice(0);
            options.dayModifiers_ = this.dayModifiers_.slice(0);
            options.inputFormat_ = this.inputFormat_;
            options.allowInputAnyChar_ = this.allowInputAnyChar_;
            options.daysOutOfMonthVisible_ = this.daysOutOfMonthVisible_;
            options.fixedRowsCount_ = this.fixedRowsCount_;
            options.toggleSelection_ = this.toggleSelection_;
            options.allowEmpty_ = this.allowEmpty_;
            options.showDeselectButton_ = this.showDeselectButton_;
            options.showResetButton_ = this.showResetButton_;
            options.monthAsDropdown_ = this.monthAsDropdown_;
            options.yearAsDropdown_ = this.yearAsDropdown_;
            options.monthAndYearSeparated_ = this.monthAndYearSeparated_;
            options.monthShort_ = this.monthShort_;
            options.changeMonthOnSwipe_ = this.changeMonthOnSwipe_;
            options.animateMonthChange_ = this.animateMonthChange_;
            options.classesPrefix_ = this.classesPrefix_;
            options.showCloseButton_ = this.showCloseButton_;
            options.closeOnEscPress_ = this.closeOnEscPress_;
            options.title_ = this.title_;
            options.dropdownItemsLimit_ = this.dropdownItemsLimit_;
            options.hideDropdownWithOneItem_ = this.hideDropdownWithOneItem_;
            options.goBackHtml_ = this.goBackHtml_;
            options.goForwardHtml_ = this.goForwardHtml_;
            options.closeHtml_ = this.closeHtml_;
            options.resetHtml_ = this.resetHtml_;
            options.deselectHtml_ = this.deselectHtml_;
            options.positionFixing_ = this.positionFixing_;
            options.fullScreenOnMobile_ = this.fullScreenOnMobile_;
            options.keyboardOnMobile_ = this.keyboardOnMobile_;
            options.includeAria_ = this.includeAria_;
            options.listeners_.beforeSelect = this.listeners_.beforeSelect.slice(0);
            options.listeners_.select = this.listeners_.select.slice(0);
            options.listeners_.beforeOpen = this.listeners_.beforeOpen.slice(0);
            options.listeners_.open = this.listeners_.open.slice(0);
            options.listeners_.beforeClose = this.listeners_.beforeClose.slice(0);
            options.listeners_.close = this.listeners_.close.slice(0);
            options.listeners_.beforeMonthChange = this.listeners_.beforeMonthChange.slice(0);
            options.listeners_.monthChange = this.listeners_.monthChange.slice(0);
            options.listeners_.beforeFocus = this.listeners_.beforeFocus.slice(0);
            options.listeners_.focus = this.listeners_.focus.slice(0);
            return options;
        };
        Options.prototype.setHideOnBlur = function (value) {
            this.hideOnBlur_ = !!value;
        };
        Options.prototype.setHideOnSelect = function (value) {
            this.hideOnSelect_ = !!value;
        };
        Options.prototype.setMinDate = function (date) {
            var normalizedDate = TheDatepicker.Helper_.normalizeDate_('Min date', date, true, this);
            this.checkConstraints_(normalizedDate, this.maxDate_);
            this.minDate_ = normalizedDate;
        };
        Options.prototype.setMaxDate = function (date) {
            var normalizedDate = TheDatepicker.Helper_.normalizeDate_('Max date', date, true, this);
            this.checkConstraints_(this.minDate_, normalizedDate);
            this.maxDate_ = normalizedDate;
        };
        Options.prototype.setInitialMonth = function (month) {
            this.initialMonth_ = TheDatepicker.Helper_.normalizeDate_('Initial month', month, true, this);
        };
        Options.prototype.setInitialDate = function (value) {
            this.initialDate_ = TheDatepicker.Helper_.normalizeDate_('Initial date', value, true, this);
        };
        Options.prototype.setInitialDatePriority = function (value) {
            this.initialDatePriority_ = !!value;
        };
        Options.prototype.setFirstDayOfWeek = function (dayOfWeek) {
            this.firstDayOfWeek_ = TheDatepicker.Helper_.checkNumber_('First day of week', dayOfWeek, 0, 6);
        };
        Options.prototype.setDateAvailabilityResolver = function (resolver) {
            TheDatepicker.Helper_.warnDeprecatedUsage_('setDateAvailabilityResolver', ['addDateAvailabilityResolver']);
            this.removeDateAvailabilityResolver();
            this.addDateAvailabilityResolver(resolver);
        };
        Options.prototype.addDateAvailabilityResolver = function (resolver) {
            this.dateAvailabilityResolvers_.push(TheDatepicker.Helper_.checkFunction_('Resolver', resolver, false));
        };
        Options.prototype.removeDateAvailabilityResolver = function (resolver) {
            if (resolver === void 0) { resolver = null; }
            this.removeCallback_(this.dateAvailabilityResolvers_, 'Resolver', resolver);
        };
        Options.prototype.setCellContentResolver = function (resolver) {
            this.cellContentResolver_ = TheDatepicker.Helper_.checkFunction_('Resolver', resolver);
        };
        Options.prototype.setCellContentStructureResolver = function (init, update) {
            if (update === void 0) { update = null; }
            init = TheDatepicker.Helper_.checkFunction_('Resolver (init)', init);
            update = TheDatepicker.Helper_.checkFunction_('Resolver (update)', update);
            this.cellContentStructureResolver_ = init ? {
                init: init,
                update: update
            } : null;
        };
        Options.prototype.setHeaderStructureResolver = function (resolver) {
            this.headerStructureResolver_ = TheDatepicker.Helper_.checkFunction_('Resolver', resolver);
        };
        Options.prototype.setFooterStructureResolver = function (resolver) {
            this.footerStructureResolver_ = TheDatepicker.Helper_.checkFunction_('Resolver', resolver);
        };
        Options.prototype.addCellClassesResolver = function (resolver) {
            this.cellClassesResolvers_.push(TheDatepicker.Helper_.checkFunction_('Resolver', resolver, false));
        };
        Options.prototype.removeCellClassesResolver = function (resolver) {
            if (resolver === void 0) { resolver = null; }
            this.removeCallback_(this.cellClassesResolvers_, 'Resolver', resolver);
        };
        Options.prototype.addDayModifier = function (modifier) {
            this.dayModifiers_.push(TheDatepicker.Helper_.checkFunction_('Modifier', modifier, false));
        };
        Options.prototype.removeDayModifier = function (modifier) {
            if (modifier === void 0) { modifier = null; }
            this.removeCallback_(this.dayModifiers_, 'Modifier', modifier);
        };
        Options.prototype.setInputFormat = function (format) {
            this.inputFormat_ = TheDatepicker.Helper_.checkString_('Input format', format, true);
        };
        Options.prototype.setAllowInputAnyChar = function (value) {
            this.allowInputAnyChar_ = !!value;
        };
        Options.prototype.setDaysOutOfMonthVisible = function (value) {
            this.daysOutOfMonthVisible_ = !!value;
        };
        Options.prototype.setFixedRowsCount = function (value) {
            this.fixedRowsCount_ = !!value;
        };
        Options.prototype.setToggleSelection = function (value) {
            this.toggleSelection_ = !!value;
        };
        Options.prototype.setShowDeselectButton = function (value) {
            this.showDeselectButton_ = !!value;
        };
        Options.prototype.setAllowEmpty = function (value) {
            this.allowEmpty_ = !!value;
        };
        Options.prototype.setShowResetButton = function (value) {
            this.showResetButton_ = !!value;
        };
        Options.prototype.setMonthAsDropdown = function (value) {
            this.monthAsDropdown_ = !!value;
        };
        Options.prototype.setYearAsDropdown = function (value) {
            this.yearAsDropdown_ = !!value;
        };
        Options.prototype.setMonthAndYearSeparated = function (value) {
            this.monthAndYearSeparated_ = !!value;
        };
        Options.prototype.setMonthShort = function (value) {
            this.monthShort_ = !!value;
        };
        Options.prototype.setChangeMonthOnSwipe = function (value) {
            this.changeMonthOnSwipe_ = !!value;
        };
        Options.prototype.setAnimateMonthChange = function (value) {
            this.animateMonthChange_ = !!value;
        };
        Options.prototype.setClassesPrefix = function (prefix) {
            this.classesPrefix_ = TheDatepicker.Helper_.checkString_('Prefix', prefix);
        };
        Options.prototype.setShowCloseButton = function (value) {
            this.showCloseButton_ = !!value;
        };
        Options.prototype.setCloseOnEscPress = function (value) {
            this.closeOnEscPress_ = !!value;
        };
        Options.prototype.setTitle = function (title) {
            this.title_ = TheDatepicker.Helper_.checkString_('Title', title);
        };
        Options.prototype.setDropdownItemsLimit = function (limit) {
            this.dropdownItemsLimit_ = TheDatepicker.Helper_.checkNumber_('Items limit', limit, 1);
        };
        Options.prototype.setHideDropdownWithOneItem = function (value) {
            this.hideDropdownWithOneItem_ = !!value;
        };
        Options.prototype.setGoBackHtml = function (html) {
            this.goBackHtml_ = TheDatepicker.Helper_.checkString_('Html', html);
        };
        Options.prototype.setGoForwardHtml = function (html) {
            this.goForwardHtml_ = TheDatepicker.Helper_.checkString_('Html', html);
        };
        Options.prototype.setCloseHtml = function (html) {
            this.closeHtml_ = TheDatepicker.Helper_.checkString_('Html', html);
        };
        Options.prototype.setResetHtml = function (html) {
            this.resetHtml_ = TheDatepicker.Helper_.checkString_('Html', html);
        };
        Options.prototype.setDeselectHtml = function (html) {
            this.deselectHtml_ = TheDatepicker.Helper_.checkString_('Html', html);
        };
        Options.prototype.setPositionFixing = function (value) {
            this.positionFixing_ = !!value;
        };
        Options.prototype.setFullScreenOnMobile = function (value) {
            this.fullScreenOnMobile_ = !!value;
        };
        Options.prototype.setKeyboardOnMobile = function (value) {
            this.keyboardOnMobile_ = !!value;
        };
        Options.prototype.setIncludeAria = function (value) {
            this.includeAria_ = !!value;
        };
        Options.prototype.setToday = function (date) {
            this.today_ = TheDatepicker.Helper_.normalizeDate_('Today', date, true, this);
        };
        Options.prototype.onBeforeSelect = function (listener) {
            this.onEvent_(EventType_.BeforeSelect, listener);
        };
        Options.prototype.offBeforeSelect = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.BeforeSelect, listener);
        };
        Options.prototype.onSelect = function (listener) {
            this.onEvent_(EventType_.Select, listener);
        };
        Options.prototype.offSelect = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.Select, listener);
        };
        Options.prototype.onBeforeOpen = function (listener) {
            this.onEvent_(EventType_.BeforeOpen, listener);
        };
        Options.prototype.offBeforeOpen = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.BeforeOpen, listener);
        };
        Options.prototype.onOpen = function (listener) {
            this.onEvent_(EventType_.Open, listener);
        };
        Options.prototype.offOpen = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.Open, listener);
        };
        Options.prototype.onBeforeClose = function (listener) {
            this.onEvent_(EventType_.BeforeClose, listener);
        };
        Options.prototype.offBeforeClose = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.BeforeClose, listener);
        };
        Options.prototype.onClose = function (listener) {
            this.onEvent_(EventType_.Close, listener);
        };
        Options.prototype.offClose = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.Close, listener);
        };
        Options.prototype.onBeforeOpenAndClose = function (listener) {
            TheDatepicker.Helper_.warnDeprecatedUsage_('onBeforeOpenAndClose', ['onBeforeOpen', 'onBeforeClose']);
            this.onBeforeOpen(listener);
            this.onBeforeClose(listener);
        };
        Options.prototype.offBeforeOpenAndClose = function (listener) {
            if (listener === void 0) { listener = null; }
            TheDatepicker.Helper_.warnDeprecatedUsage_('offBeforeOpenAndClose', ['offBeforeOpen', 'offBeforeClose']);
            this.offBeforeOpen(listener);
            this.offBeforeClose(listener);
        };
        Options.prototype.onOpenAndClose = function (listener) {
            TheDatepicker.Helper_.warnDeprecatedUsage_('onOpenAndClose', ['onOpen', 'onClose']);
            this.onOpen(listener);
            this.onClose(listener);
        };
        Options.prototype.offOpenAndClose = function (listener) {
            if (listener === void 0) { listener = null; }
            TheDatepicker.Helper_.warnDeprecatedUsage_('offOpenAndClose', ['offOpen', 'offClose']);
            this.offOpen(listener);
            this.offClose(listener);
        };
        Options.prototype.onBeforeMonthChange = function (listener) {
            this.onEvent_(EventType_.BeforeMonthChange, listener);
        };
        Options.prototype.offBeforeMonthChange = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.BeforeMonthChange, listener);
        };
        Options.prototype.onMonthChange = function (listener) {
            this.onEvent_(EventType_.MonthChange, listener);
        };
        Options.prototype.offMonthChange = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.MonthChange, listener);
        };
        Options.prototype.onBeforeFocus = function (listener) {
            this.onEvent_(EventType_.BeforeFocus, listener);
        };
        Options.prototype.offBeforeFocus = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.BeforeFocus, listener);
        };
        Options.prototype.onFocus = function (listener) {
            this.onEvent_(EventType_.Focus, listener);
        };
        Options.prototype.offFocus = function (listener) {
            if (listener === void 0) { listener = null; }
            this.offEvent_(EventType_.Focus, listener);
        };
        Options.prototype.getInitialMonth = function () {
            var primarySource = this.initialDatePriority_ ? this.initialDate_ : this.initialMonth_;
            var secondarySource = this.initialDatePriority_ ? this.initialMonth_ : this.initialDate_;
            var initialMonth = primarySource
                ? new Date(primarySource.getTime())
                : (secondarySource
                    ? new Date(secondarySource.getTime())
                    : this.getToday());
            initialMonth.setDate(1);
            return this.correctMonth(initialMonth);
        };
        Options.prototype.isMonthInValidity = function (month) {
            return !this.calculateMonthCorrection_(month);
        };
        Options.prototype.correctMonth = function (month) {
            var correctMonth = this.calculateMonthCorrection_(month);
            return correctMonth || month;
        };
        Options.prototype.getInitialDate = function () {
            return this.findPossibleAvailableDate(this.initialDate_);
        };
        Options.prototype.findPossibleAvailableDate = function (date) {
            if (this.isAllowedEmpty()) {
                return date && this.isDateInValidity(date) && this.isDateAvailable(date)
                    ? new Date(date.getTime())
                    : null;
            }
            date = date ? new Date(date.getTime()) : this.getToday();
            date = this.findNearestAvailableDate(date);
            if (date) {
                return date;
            }
            throw new AvailableDateNotFoundException();
        };
        Options.prototype.findNearestAvailableDate = function (date) {
            date = this.correctDate_(date);
            if (this.isDateAvailable(date)) {
                return date;
            }
            var minDate = this.getMinDate_().getTime();
            var maxDate = this.getMaxDate_().getTime();
            var maxLoops = 1000;
            var increasedDate = date;
            var decreasedDate = new Date(date.getTime());
            do {
                if (increasedDate) {
                    increasedDate.setDate(increasedDate.getDate() + 1);
                    if (increasedDate.getTime() > maxDate) {
                        increasedDate = null;
                    }
                    else if (this.isDateAvailable(increasedDate)) {
                        return increasedDate;
                    }
                }
                if (decreasedDate) {
                    decreasedDate.setDate(decreasedDate.getDate() - 1);
                    if (decreasedDate.getTime() < minDate) {
                        decreasedDate = null;
                    }
                    else if (this.isDateAvailable(decreasedDate)) {
                        return decreasedDate;
                    }
                }
                maxLoops--;
            } while ((increasedDate || decreasedDate) && maxLoops > 0);
            return null;
        };
        Options.prototype.isDateInValidity = function (date) {
            return !this.calculateDateCorrection_(date);
        };
        Options.prototype.correctDate_ = function (date) {
            var correctDate = this.calculateDateCorrection_(date);
            return correctDate || date;
        };
        Options.prototype.getFirstDayOfWeek = function () {
            return this.firstDayOfWeek_;
        };
        Options.prototype.areDaysOutOfMonthVisible = function () {
            return this.daysOutOfMonthVisible_;
        };
        Options.prototype.hasFixedRowsCount = function () {
            return this.fixedRowsCount_;
        };
        Options.prototype.hasToggleSelection = function () {
            return this.allowEmpty_ && this.toggleSelection_;
        };
        Options.prototype.isAllowedEmpty = function () {
            return this.allowEmpty_;
        };
        Options.prototype.isDeselectButtonShown = function () {
            return this.allowEmpty_ && this.showDeselectButton_;
        };
        Options.prototype.isResetButtonShown = function () {
            return this.showResetButton_;
        };
        Options.prototype.isMonthAsDropdown = function () {
            return this.monthAsDropdown_;
        };
        Options.prototype.isYearAsDropdown = function () {
            return this.yearAsDropdown_;
        };
        Options.prototype.isMonthAndYearSeparated = function () {
            return this.monthAndYearSeparated_;
        };
        Options.prototype.isMonthShort = function () {
            return this.monthShort_;
        };
        Options.prototype.isMonthChangeOnSwipeEnabled_ = function () {
            return this.changeMonthOnSwipe_;
        };
        Options.prototype.isMonthChangeAnimated = function () {
            return this.animateMonthChange_;
        };
        Options.prototype.getClassesPrefix = function () {
            return this.classesPrefix_;
        };
        Options.prototype.isCloseButtonShown = function () {
            return this.hideOnBlur_ && this.showCloseButton_;
        };
        Options.prototype.isClosedOnEscPress = function () {
            return this.hideOnBlur_ && this.closeOnEscPress_;
        };
        Options.prototype.getTitle = function () {
            return this.title_;
        };
        Options.prototype.getMinDate = function () {
            return this.minDate_ ? new Date(this.minDate_.getTime()) : null;
        };
        Options.prototype.getMaxDate = function () {
            return this.maxDate_ ? new Date(this.maxDate_.getTime()) : null;
        };
        Options.prototype.getMinDate_ = function () {
            var minDate = this.getMinDate();
            if (!minDate) {
                return new Date(-271821, 4, 1);
            }
            return minDate;
        };
        Options.prototype.getMaxDate_ = function () {
            var maxDate = this.getMaxDate();
            if (!maxDate) {
                return new Date(275760, 7, 31);
            }
            return maxDate;
        };
        Options.prototype.getMinMonth = function () {
            if (!this.minDate_) {
                return null;
            }
            var minMonth = new Date(this.minDate_.getTime());
            minMonth.setDate(1);
            return minMonth;
        };
        Options.prototype.getMaxMonth = function () {
            if (!this.maxDate_) {
                return null;
            }
            var maxMonth = new Date(this.maxDate_.getTime());
            maxMonth.setDate(1);
            return maxMonth;
        };
        Options.prototype.getMinMonth_ = function () {
            var minMonth = this.getMinMonth();
            if (!minMonth) {
                minMonth = this.getMinDate_();
            }
            return minMonth;
        };
        Options.prototype.getMaxMonth_ = function () {
            var maxMonth = this.getMaxMonth();
            if (!maxMonth) {
                maxMonth = this.getMaxDate_();
                maxMonth.setDate(1);
            }
            return maxMonth;
        };
        Options.prototype.isDropdownWithOneItemHidden = function () {
            return this.hideDropdownWithOneItem_;
        };
        Options.prototype.getDropdownItemsLimit = function () {
            return this.dropdownItemsLimit_;
        };
        Options.prototype.isDateAvailable = function (date) {
            var dateAvailabilityResolvers = this.dateAvailabilityResolvers_.slice(0);
            for (var index = 0; index < dateAvailabilityResolvers.length; index++) {
                if (!dateAvailabilityResolvers[index](new Date(date.getTime()))) {
                    return false;
                }
            }
            return true;
        };
        Options.prototype.getCellContent = function (day) {
            if (this.cellContentResolver_) {
                return this.cellContentResolver_(day);
            }
            return day.dayNumber + '';
        };
        Options.prototype.prefixClass_ = function (name) {
            return this.classesPrefix_ + name;
        };
        Options.prototype.getCellStructure_ = function () {
            if (this.cellContentStructureResolver_) {
                return this.cellContentStructureResolver_.init();
            }
            return TheDatepicker.HtmlHelper_.createSpan_();
        };
        Options.prototype.updateCellStructure_ = function (element, day) {
            if (this.cellContentStructureResolver_) {
                this.cellContentStructureResolver_.update(element, day);
            }
            else {
                element.innerText = this.getCellContent(day);
            }
        };
        Options.prototype.getHeaderStructure_ = function () {
            return this.headerStructureResolver_ ? this.headerStructureResolver_() : null;
        };
        Options.prototype.getFooterStructure_ = function () {
            return this.footerStructureResolver_ ? this.footerStructureResolver_() : null;
        };
        Options.prototype.getCellClasses = function (day) {
            var result = [];
            var cellClassesResolvers = this.cellClassesResolvers_.slice(0);
            for (var index = 0; index < cellClassesResolvers.length; index++) {
                var classes = cellClassesResolvers[index](day);
                if (typeof classes === 'string') {
                    result.push(classes);
                }
                else if (typeof classes === 'object' && classes.constructor === Array) {
                    result = result.concat(classes);
                }
            }
            return result;
        };
        Options.prototype.modifyDay = function (day) {
            var dayModifiers = this.dayModifiers_.slice(0);
            for (var index = 0; index < dayModifiers.length; index++) {
                dayModifiers[index](day);
            }
        };
        Options.prototype.getGoBackHtml = function () {
            return this.goBackHtml_;
        };
        Options.prototype.getGoForwardHtml = function () {
            return this.goForwardHtml_;
        };
        Options.prototype.getCloseHtml = function () {
            return this.closeHtml_;
        };
        Options.prototype.getResetHtml = function () {
            return this.resetHtml_;
        };
        Options.prototype.getDeselectHtml = function () {
            return this.deselectHtml_;
        };
        Options.prototype.isHiddenOnBlur = function () {
            return this.hideOnBlur_;
        };
        Options.prototype.isHiddenOnSelect = function () {
            return this.hideOnBlur_ && this.hideOnSelect_;
        };
        Options.prototype.getInputFormat = function () {
            return this.inputFormat_;
        };
        Options.prototype.isAllowedInputAnyChar = function () {
            return this.allowInputAnyChar_;
        };
        Options.prototype.isPositionFixingEnabled = function () {
            return this.hideOnBlur_ && this.positionFixing_;
        };
        Options.prototype.isFullScreenOnMobile = function () {
            return this.hideOnBlur_ && this.fullScreenOnMobile_;
        };
        Options.prototype.isKeyboardOnMobile = function () {
            return this.keyboardOnMobile_;
        };
        Options.prototype.isAriaIncluded = function () {
            return this.includeAria_;
        };
        Options.prototype.getToday = function () {
            return this.today_ ? new Date(this.today_.getTime()) : TheDatepicker.Helper_.resetTime_(new Date());
        };
        Options.prototype.getDateAvailabilityResolver = function () {
            TheDatepicker.Helper_.warnDeprecatedUsage_('getDateAvailabilityResolver', ['getDateAvailabilityResolvers']);
            return this.dateAvailabilityResolvers_.length > 0 ? this.dateAvailabilityResolvers_[0] : null;
        };
        Options.prototype.getDateAvailabilityResolvers = function () {
            return this.dateAvailabilityResolvers_.slice(0);
        };
        Options.prototype.getCellContentResolver = function () {
            return this.cellContentResolver_;
        };
        Options.prototype.getCellContentStructureResolver = function () {
            return this.cellContentStructureResolver_;
        };
        Options.prototype.getHeaderStructureResolver = function () {
            return this.headerStructureResolver_;
        };
        Options.prototype.getFooterStructureResolver = function () {
            return this.footerStructureResolver_;
        };
        Options.prototype.getCellClassesResolvers = function () {
            return this.cellClassesResolvers_.slice(0);
        };
        Options.prototype.getDayModifiers = function () {
            return this.dayModifiers_.slice(0);
        };
        Options.prototype.getBeforeSelectListeners = function () {
            return this.listeners_.beforeSelect.slice(0);
        };
        Options.prototype.getSelectListeners = function () {
            return this.listeners_.select.slice(0);
        };
        Options.prototype.getBeforeOpenListeners = function () {
            return this.listeners_.beforeOpen.slice(0);
        };
        Options.prototype.getOpenListeners = function () {
            return this.listeners_.open.slice(0);
        };
        Options.prototype.getBeforeCloseListeners = function () {
            return this.listeners_.beforeClose.slice(0);
        };
        Options.prototype.getCloseListeners = function () {
            return this.listeners_.close.slice(0);
        };
        Options.prototype.getBeforeOpenAndCloseListeners = function () {
            TheDatepicker.Helper_.warnDeprecatedUsage_('getBeforeOpenAndCloseListeners', ['getBeforeOpenListeners', 'getBeforeCloseListeners']);
            return this.listeners_.beforeOpen.concat(this.listeners_.beforeClose);
        };
        Options.prototype.getOpenAndCloseListeners = function () {
            TheDatepicker.Helper_.warnDeprecatedUsage_('getOpenAndCloseListeners', ['getOpenListeners', 'getCloseListeners']);
            return this.listeners_.open.concat(this.listeners_.close);
        };
        Options.prototype.getBeforeMonthChangeListeners = function () {
            return this.listeners_.beforeMonthChange.slice(0);
        };
        Options.prototype.getMonthChangeListeners = function () {
            return this.listeners_.monthChange.slice(0);
        };
        Options.prototype.getBeforeFocusListeners = function () {
            return this.listeners_.beforeFocus.slice(0);
        };
        Options.prototype.getFocusListeners = function () {
            return this.listeners_.focus.slice(0);
        };
        Options.prototype.checkConstraints_ = function (minDate, maxDate) {
            if (minDate && maxDate && minDate.getTime() > maxDate.getTime()) {
                throw new Error('Min date cannot be higher then max date.');
            }
        };
        Options.prototype.calculateMonthCorrection_ = function (month) {
            var minMonth = this.getMinMonth_();
            if (month.getTime() < minMonth.getTime()) {
                return minMonth;
            }
            var maxMonth = this.getMaxMonth_();
            if (month.getTime() > maxMonth.getTime()) {
                return maxMonth;
            }
            return null;
        };
        Options.prototype.calculateDateCorrection_ = function (date) {
            var minDate = this.getMinDate_();
            if (date.getTime() < minDate.getTime()) {
                return minDate;
            }
            var maxDate = this.getMaxDate_();
            if (date.getTime() > maxDate.getTime()) {
                return maxDate;
            }
            return null;
        };
        Options.prototype.removeCallback_ = function (callbacksList, parameterName, callback) {
            callback = TheDatepicker.Helper_.checkFunction_(parameterName, callback);
            if (!callback) {
                callbacksList.splice(0, callbacksList.length);
            }
            else {
                var callbacks = callbacksList.slice(0);
                for (var index = callbacks.length - 1; index >= 0; index--) {
                    if (callbacks[index] === callback) {
                        callbacksList.splice(index, 1);
                    }
                }
            }
        };
        Options.prototype.onEvent_ = function (eventType, listener) {
            this.listeners_[eventType].push(TheDatepicker.Helper_.checkFunction_('Event listener', listener, false));
        };
        Options.prototype.offEvent_ = function (eventType, listener) {
            listener = TheDatepicker.Helper_.checkFunction_('Event listener', listener);
            if (!listener) {
                this.listeners_[eventType] = [];
            }
            else {
                var newListeners = [];
                for (var index = 0; index < this.listeners_[eventType].length; index++) {
                    if (this.listeners_[eventType][index] !== listener) {
                        newListeners.push(this.listeners_[eventType][index]);
                    }
                }
                this.listeners_[eventType] = newListeners;
            }
        };
        Options.prototype.triggerEvent_ = function (eventType, caller) {
            var listeners = this.listeners_[eventType].slice(0);
            for (var index = 0; index < listeners.length; index++) {
                if (caller(listeners[index]) === false) {
                    return false;
                }
            }
            return true;
        };
        return Options;
    }());
    TheDatepicker.Options = Options;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var Template_ = (function () {
        function Template_(options_, container_, hasInput_) {
            this.options_ = options_;
            this.container_ = container_;
            this.hasInput_ = hasInput_;
            this.mainElement_ = null;
            this.bodyElement_ = null;
            this.controlElement_ = null;
            this.goBackElement_ = null;
            this.goForwardElement_ = null;
            this.titleElement_ = null;
            this.titleContentElement_ = null;
            this.resetElement_ = null;
            this.closeElement_ = null;
            this.monthSelect_ = null;
            this.monthElement_ = null;
            this.yearSelect_ = null;
            this.yearElement_ = null;
            this.monthAndYearSelect_ = null;
            this.monthAndYearElement_ = null;
            this.weeksElements_ = [];
            this.daysElements_ = [];
            this.daysButtonsElements_ = [];
            this.daysContentsElements_ = [];
        }
        Template_.prototype.render_ = function (viewModel) {
            if (!this.mainElement_) {
                if (this.hasInput_ && this.options_.isHiddenOnBlur() && !viewModel.isActive_()) {
                    return;
                }
                this.container_.innerHTML = '';
                this.container_.appendChild(this.createSkeleton_(viewModel));
            }
            this.updateMainElement_(viewModel);
            this.updateTopElement_(viewModel);
            this.updateTitleElement_(viewModel);
            this.updateCloseElement_(viewModel);
            this.updateResetElement_(viewModel);
            this.updateGoBackElement_(viewModel);
            this.updateGoForwardElement_(viewModel);
            this.updateMonthElement_(viewModel);
            this.updateYearElement_(viewModel);
            this.updateMonthAndYearElement_(viewModel);
            this.updateWeeksElements_(viewModel);
        };
        Template_.prototype.createSkeleton_ = function (viewModel) {
            var main = TheDatepicker.HtmlHelper_.createDiv_('main', this.options_);
            TheDatepicker.HtmlHelper_.appendChild_(main, this.options_.getHeaderStructure_());
            main.appendChild(this.createHeaderElement_(viewModel));
            main.appendChild(this.createBodyElement_(viewModel));
            TheDatepicker.HtmlHelper_.appendChild_(main, this.options_.getFooterStructure_());
            this.mainElement_ = main;
            return main;
        };
        Template_.prototype.updateMainElement_ = function (viewModel) {
            this.mainElement_.style.display = !this.hasInput_ || viewModel.isActive_() || !this.options_.isHiddenOnBlur() ? '' : 'none';
        };
        Template_.prototype.createBodyElement_ = function (viewModel) {
            var _this = this;
            var body = TheDatepicker.HtmlHelper_.createDiv_('body', this.options_);
            if (this.options_.isMonthChangeOnSwipeEnabled_()) {
                TheDatepicker.Helper_.addSwipeListener_(body, function (event, isRightMove) {
                    _this.slideMonth_(viewModel, event, !isRightMove);
                });
            }
            body.appendChild(this.createTableElement_(viewModel));
            this.bodyElement_ = body;
            return body;
        };
        Template_.prototype.createHeaderElement_ = function (viewModel) {
            var header = TheDatepicker.HtmlHelper_.createDiv_('header', this.options_);
            var top = TheDatepicker.HtmlHelper_.createDiv_('top', this.options_);
            header.appendChild(top);
            top.appendChild(this.createTitleElement_(viewModel));
            var control = TheDatepicker.HtmlHelper_.createDiv_('control', this.options_);
            top.appendChild(control);
            control.appendChild(this.createResetElement_(viewModel));
            control.appendChild(this.createCloseElement_(viewModel));
            var navigation = TheDatepicker.HtmlHelper_.createDiv_('navigation', this.options_);
            header.appendChild(navigation);
            navigation.appendChild(this.createGoBackElement_(viewModel));
            var state = TheDatepicker.HtmlHelper_.createDiv_('state', this.options_);
            navigation.appendChild(state);
            if (this.options_.isMonthAndYearSeparated()) {
                state.appendChild(this.createMonthElement_(viewModel));
                state.appendChild(this.createYearElement_(viewModel));
            }
            else {
                state.appendChild(this.createMonthAndYearElement_(viewModel));
            }
            navigation.appendChild(this.createGoForwardElement_(viewModel));
            this.controlElement_ = control;
            return header;
        };
        Template_.prototype.updateTopElement_ = function (viewModel) {
            var isVisible = this.options_.getTitle() !== ''
                || this.options_.isResetButtonShown()
                || (this.hasInput_ && this.options_.isCloseButtonShown());
            this.controlElement_.style.display = isVisible ? '' : 'none';
            this.titleElement_.style.display = isVisible ? '' : 'none';
        };
        Template_.prototype.createTitleElement_ = function (viewModel) {
            var titleElement = TheDatepicker.HtmlHelper_.createDiv_('title', this.options_);
            var titleContent = TheDatepicker.HtmlHelper_.createSpan_();
            titleElement.appendChild(titleContent);
            TheDatepicker.HtmlHelper_.addClass_(titleContent, 'title-content', this.options_);
            this.titleElement_ = titleElement;
            this.titleContentElement_ = titleContent;
            return titleElement;
        };
        Template_.prototype.updateTitleElement_ = function (viewModel) {
            var title = this.options_.getTitle();
            this.titleContentElement_.style.display = title !== '' ? '' : 'none';
            this.titleContentElement_.innerText = title;
        };
        Template_.prototype.createResetElement_ = function (viewModel) {
            var resetElement = TheDatepicker.HtmlHelper_.createDiv_('reset', this.options_);
            var resetButton = TheDatepicker.HtmlHelper_.createAnchor_(function (event) {
                viewModel.reset_(event);
            }, this.options_);
            resetButton.innerHTML = this.options_.getResetHtml();
            this.addTitle_(resetButton, TheDatepicker.TitleName.Reset);
            resetElement.appendChild(resetButton);
            this.resetElement_ = resetElement;
            return resetElement;
        };
        Template_.prototype.updateResetElement_ = function (viewModel) {
            this.resetElement_.style.display = this.options_.isResetButtonShown() ? '' : 'none';
        };
        Template_.prototype.createCloseElement_ = function (viewModel) {
            var closeElement = TheDatepicker.HtmlHelper_.createDiv_('close', this.options_);
            var closeButton = TheDatepicker.HtmlHelper_.createAnchor_(function (event) {
                viewModel.close_(event);
            }, this.options_);
            closeButton.innerHTML = this.options_.getCloseHtml();
            this.addTitle_(closeButton, TheDatepicker.TitleName.Close);
            closeElement.appendChild(closeButton);
            this.closeElement_ = closeElement;
            return closeElement;
        };
        Template_.prototype.updateCloseElement_ = function (viewModel) {
            this.closeElement_.style.display = this.hasInput_ && this.options_.isCloseButtonShown() ? '' : 'none';
        };
        Template_.prototype.createGoBackElement_ = function (viewModel) {
            return this.createGoElement_(viewModel, false);
        };
        Template_.prototype.createGoForwardElement_ = function (viewModel) {
            return this.createGoElement_(viewModel, true);
        };
        Template_.prototype.createGoElement_ = function (viewModel, directionForward) {
            var _this = this;
            var goElement = TheDatepicker.HtmlHelper_.createDiv_('go', this.options_);
            TheDatepicker.HtmlHelper_.addClass_(goElement, directionForward ? 'go-next' : 'go-previous', this.options_);
            var goButton = TheDatepicker.HtmlHelper_.createAnchor_(function (event) {
                _this.slideMonth_(viewModel, event, directionForward);
            }, this.options_);
            goButton.innerHTML = directionForward ? this.options_.getGoForwardHtml() : this.options_.getGoBackHtml();
            this.addTitle_(goButton, directionForward ? TheDatepicker.TitleName.GoForward : TheDatepicker.TitleName.GoBack);
            goElement.appendChild(goButton);
            if (directionForward) {
                this.goForwardElement_ = goButton;
            }
            else {
                this.goBackElement_ = goButton;
            }
            return goElement;
        };
        Template_.prototype.updateGoBackElement_ = function (viewModel) {
            this.goBackElement_.style.visibility = viewModel.canGoBack_() ? 'visible' : 'hidden';
        };
        Template_.prototype.updateGoForwardElement_ = function (viewModel) {
            this.goForwardElement_.style.visibility = viewModel.canGoForward_() ? 'visible' : 'hidden';
        };
        Template_.prototype.createMonthElement_ = function (viewModel) {
            var _this = this;
            var options = [];
            for (var monthNumber = 0; monthNumber < 12; monthNumber++) {
                options.push({
                    value: monthNumber + '',
                    label: this.translateMonth_(monthNumber)
                });
            }
            var selectElement = TheDatepicker.HtmlHelper_.createSelectInput_(options, function (event, monthNumber) {
                var currentMonth = viewModel.getCurrentMonth_();
                var newMonth = new Date(currentMonth.getTime());
                newMonth.setMonth(parseInt(monthNumber, 10));
                if (!viewModel.goToMonth_(event, newMonth)) {
                    _this.monthSelect_.value = currentMonth.getMonth() + '';
                }
            }, this.options_);
            this.addTitle_(selectElement, TheDatepicker.TitleName.Month);
            var monthElement = TheDatepicker.HtmlHelper_.createDiv_('month', this.options_);
            var monthContent = TheDatepicker.HtmlHelper_.createSpan_();
            monthElement.appendChild(selectElement);
            monthElement.appendChild(monthContent);
            this.monthElement_ = monthContent;
            this.monthSelect_ = selectElement;
            return monthElement;
        };
        Template_.prototype.updateMonthElement_ = function (viewModel) {
            if (!this.monthElement_) {
                return;
            }
            var currentMonth = viewModel.getCurrentMonth_().getMonth();
            this.monthElement_.innerText = this.translateMonth_(currentMonth);
            if (!this.options_.isMonthAsDropdown()) {
                this.monthSelect_.style.display = 'none';
                this.monthElement_.style.display = '';
                return;
            }
            var valuesCount = 0;
            for (var monthNumber = 0; monthNumber < 12; monthNumber++) {
                var newMonth = new Date(viewModel.getCurrentMonth_().getTime());
                newMonth.setMonth(monthNumber);
                var option = this.monthSelect_.getElementsByTagName('option')[monthNumber];
                var canGoToMonth = viewModel.canGoToMonth_(newMonth);
                option.disabled = !canGoToMonth;
                option.style.display = canGoToMonth ? '' : 'none';
                valuesCount += canGoToMonth ? 1 : 0;
            }
            this.monthSelect_.value = currentMonth + '';
            var showSelect = !this.options_.isDropdownWithOneItemHidden() || valuesCount > 1;
            this.monthSelect_.style.display = showSelect ? '' : 'none';
            this.monthElement_.style.display = showSelect ? 'none' : '';
        };
        Template_.prototype.createYearElement_ = function (viewModel) {
            var _this = this;
            var selectElement = TheDatepicker.HtmlHelper_.createSelectInput_([], function (event, year) {
                var currentMonth = viewModel.getCurrentMonth_();
                var newMonth = new Date(currentMonth.getTime());
                newMonth.setFullYear(parseInt(year, 10));
                var minMonth = _this.options_.getMinMonth_();
                var maxMonth = _this.options_.getMaxMonth_();
                if (newMonth.getTime() < minMonth.getTime()) {
                    newMonth = minMonth;
                }
                if (newMonth.getTime() > maxMonth.getTime()) {
                    newMonth = maxMonth;
                }
                if (!viewModel.goToMonth_(event, newMonth)) {
                    _this.yearSelect_.value = currentMonth.getFullYear() + '';
                }
            }, this.options_);
            this.addTitle_(selectElement, TheDatepicker.TitleName.Year);
            var yearElement = TheDatepicker.HtmlHelper_.createDiv_('year', this.options_);
            var yearContent = TheDatepicker.HtmlHelper_.createSpan_();
            yearElement.appendChild(selectElement);
            yearElement.appendChild(yearContent);
            this.yearElement_ = yearContent;
            this.yearSelect_ = selectElement;
            return yearElement;
        };
        Template_.prototype.updateYearElement_ = function (viewModel) {
            if (!this.yearElement_) {
                return;
            }
            var currentYear = viewModel.getCurrentMonth_().getFullYear();
            this.yearElement_.innerText = currentYear + '';
            if (!this.options_.isYearAsDropdown()) {
                this.yearSelect_.style.display = 'none';
                this.yearElement_.style.display = '';
                return;
            }
            var minYear = this.options_.getMinDate_().getFullYear();
            var maxYear = this.options_.getMaxDate_().getFullYear();
            var range = this.calculateDropdownRange_(currentYear, minYear, maxYear);
            var options = this.yearSelect_.getElementsByTagName('option');
            var diff = this.calculateDropdownDiff_(options, range, function (value) {
                return parseInt(value, 10);
            });
            for (var index = 0; index < diff.remove.length; index++) {
                this.yearSelect_.removeChild(diff.remove[index]);
            }
            for (var index = diff.prepend.length - 1; index >= 0; index--) {
                this.yearSelect_.insertBefore(TheDatepicker.HtmlHelper_.createSelectOption_(diff.prepend[index] + '', diff.prepend[index] + ''), this.yearSelect_.firstChild);
            }
            for (var index = 0; index < diff.append.length; index++) {
                this.yearSelect_.appendChild(TheDatepicker.HtmlHelper_.createSelectOption_(diff.append[index] + '', diff.append[index] + ''));
            }
            this.yearSelect_.value = currentYear + '';
            var showSelect = !this.options_.isDropdownWithOneItemHidden() || range.from < range.to;
            this.yearSelect_.style.display = showSelect ? '' : 'none';
            this.yearElement_.style.display = showSelect ? 'none' : '';
        };
        Template_.prototype.createMonthAndYearElement_ = function (viewModel) {
            var _this = this;
            var monthAndYear = TheDatepicker.HtmlHelper_.createDiv_('month-year', this.options_);
            var selectElement = TheDatepicker.HtmlHelper_.createSelectInput_([], function (event, value) {
                var currentMonth = viewModel.getCurrentMonth_();
                var newMonth = new Date(currentMonth.getTime());
                var data = _this.parseMonthAndYearOptionValue_(value);
                newMonth.setFullYear(data.year);
                newMonth.setMonth(data.month);
                if (!viewModel.goToMonth_(event, newMonth)) {
                    _this.monthAndYearSelect_.value = _this.getMonthAndYearOptionValue_({
                        month: currentMonth.getMonth(),
                        year: currentMonth.getFullYear()
                    });
                }
            }, this.options_);
            var monthAndYearContent = TheDatepicker.HtmlHelper_.createSpan_();
            this.monthAndYearElement_ = monthAndYearContent;
            this.monthAndYearSelect_ = selectElement;
            monthAndYear.appendChild(monthAndYearContent);
            monthAndYear.appendChild(selectElement);
            return monthAndYear;
        };
        Template_.prototype.updateMonthAndYearElement_ = function (viewModel) {
            var _this = this;
            if (!this.monthAndYearElement_) {
                return;
            }
            var currentMonth = viewModel.getCurrentMonth_();
            var currentData = {
                month: currentMonth.getMonth(),
                year: currentMonth.getFullYear()
            };
            var currentIndex = this.calculateMonthAndYearIndex_(currentData);
            this.monthAndYearElement_.innerText = this.translateMonthAndYear_(currentData);
            if (!this.options_.isYearAsDropdown() || !this.options_.isMonthAsDropdown()) {
                this.monthAndYearSelect_.style.display = 'none';
                this.monthAndYearElement_.style.display = '';
                return;
            }
            var minDate = this.options_.getMinDate_();
            var maxDate = this.options_.getMaxDate_();
            var minIndex = minDate.getFullYear() * 12 + minDate.getMonth();
            var maxIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
            var range = this.calculateDropdownRange_(currentIndex, minIndex, maxIndex);
            var options = this.monthAndYearSelect_.getElementsByTagName('option');
            var diff = this.calculateDropdownDiff_(options, range, function (value) {
                return _this.calculateMonthAndYearIndex_(_this.parseMonthAndYearOptionValue_(value));
            });
            for (var index = 0; index < diff.remove.length; index++) {
                this.monthAndYearSelect_.removeChild(diff.remove[index]);
            }
            for (var index = diff.prepend.length - 1; index >= 0; index--) {
                var data = this.getMonthAndYearByIndex_(diff.prepend[index]);
                this.monthAndYearSelect_.insertBefore(TheDatepicker.HtmlHelper_.createSelectOption_(this.getMonthAndYearOptionValue_(data), this.translateMonthAndYear_(data)), this.monthAndYearSelect_.firstChild);
            }
            for (var index = 0; index < diff.append.length; index++) {
                var data = this.getMonthAndYearByIndex_(diff.append[index]);
                this.monthAndYearSelect_.appendChild(TheDatepicker.HtmlHelper_.createSelectOption_(this.getMonthAndYearOptionValue_(data), this.translateMonthAndYear_(data)));
            }
            this.monthAndYearSelect_.value = this.getMonthAndYearOptionValue_(currentData);
            var showSelect = !this.options_.isDropdownWithOneItemHidden() || range.from < range.to;
            this.monthAndYearSelect_.style.display = showSelect ? '' : 'none';
            this.monthAndYearElement_.style.display = showSelect ? 'none' : '';
        };
        Template_.prototype.translateMonthAndYear_ = function (data) {
            return this.translateMonth_(data.month) + ' ' + data.year;
        };
        Template_.prototype.calculateMonthAndYearIndex_ = function (data) {
            return data.year * 12 + data.month;
        };
        Template_.prototype.getMonthAndYearByIndex_ = function (index) {
            return {
                year: Math.floor(index / 12),
                month: index % 12
            };
        };
        Template_.prototype.getMonthAndYearOptionValue_ = function (data) {
            return data.year + '-' + data.month;
        };
        Template_.prototype.parseMonthAndYearOptionValue_ = function (value) {
            var parts = value.split('-');
            return {
                month: parseInt(parts[1], 10),
                year: parseInt(parts[0], 10)
            };
        };
        Template_.prototype.calculateDropdownRange_ = function (current, min, max) {
            var limit = this.options_.getDropdownItemsLimit() - 1;
            var maxAppend = Math.ceil(limit / 2);
            var from = current - (limit - maxAppend);
            var to = current + maxAppend;
            if (from < min) {
                to += min - from;
                if (to > max) {
                    to = max;
                }
                from = min;
            }
            else if (to > max) {
                from -= to - max;
                if (from < min) {
                    from = min;
                }
                to = max;
            }
            return {
                from: from,
                to: to
            };
        };
        Template_.prototype.calculateDropdownDiff_ = function (options, newRange, getNumerical) {
            var firstOption = options.length > 0 ? getNumerical(options[0].value) : null;
            var lastOption = options.length > 0 ? getNumerical(options[options.length - 1].value) : null;
            var prepend = [];
            var append = [];
            var remove = [];
            for (var value = newRange.from; value <= newRange.to; value++) {
                if (firstOption === null || value < firstOption) {
                    prepend.push(value);
                }
                else if (value > lastOption) {
                    append.push(value);
                }
            }
            for (var index = 0; index < options.length; index++) {
                var value = getNumerical(options[index].value);
                if (value < newRange.from || value > newRange.to) {
                    remove.push(options[index]);
                }
            }
            return {
                prepend: prepend,
                append: append,
                remove: remove
            };
        };
        Template_.prototype.createTableElement_ = function (viewModel) {
            var tableHeader = this.createTableHeaderElement_(viewModel);
            var tableBody = this.createTableBodyElement_(viewModel);
            return TheDatepicker.HtmlHelper_.createTable_('calendar', tableHeader, tableBody, this.options_);
        };
        Template_.prototype.createTableHeaderElement_ = function (viewModel) {
            var weekDays = viewModel.getWeekDays_();
            var cells = [];
            for (var index = 0; index < weekDays.length; index++) {
                var dayOfWeek = weekDays[index];
                cells.push(this.createTableHeaderCellElement_(viewModel, dayOfWeek));
            }
            return TheDatepicker.HtmlHelper_.createTableHeader_('calendar-header', cells, this.options_);
        };
        Template_.prototype.createTableHeaderCellElement_ = function (viewModel, dayOfWeek) {
            var headerCell = TheDatepicker.HtmlHelper_.createTableHeaderCell_('week-day', this.options_);
            if (dayOfWeek === TheDatepicker.DayOfWeek.Saturday || dayOfWeek === TheDatepicker.DayOfWeek.Sunday) {
                TheDatepicker.HtmlHelper_.addClass_(headerCell, 'week-day--weekend', this.options_);
            }
            headerCell.innerText = this.options_.translator.translateDayOfWeek(dayOfWeek);
            return headerCell;
        };
        Template_.prototype.createTableBodyElement_ = function (viewModel) {
            this.daysElements_ = [];
            this.daysButtonsElements_ = [];
            this.daysContentsElements_ = [];
            var rows = [];
            for (var index = 0; index < 6; index++) {
                rows.push(this.createTableRowElement_(viewModel));
            }
            this.weeksElements_ = rows;
            return TheDatepicker.HtmlHelper_.createTableBody_('calendar-body', rows, this.options_);
        };
        Template_.prototype.updateWeeksElements_ = function (viewModel) {
            var weeks = viewModel.getWeeks_();
            for (var weekIndex = 0; weekIndex < this.weeksElements_.length; weekIndex++) {
                var weekElement = this.weeksElements_[weekIndex];
                var week = weeks.length > weekIndex ? weeks[weekIndex] : null;
                weekElement.style.display = week ? '' : 'none';
                if (week) {
                    for (var dayIndex = 0; dayIndex < this.daysElements_[weekIndex].length; dayIndex++) {
                        this.updateDayElement_(viewModel, this.daysElements_[weekIndex][dayIndex], this.daysButtonsElements_[weekIndex][dayIndex], this.daysContentsElements_[weekIndex][dayIndex], week[dayIndex]);
                    }
                }
            }
        };
        Template_.prototype.createTableRowElement_ = function (viewModel) {
            var cells = [];
            var cellsButtons = [];
            var cellsContents = [];
            for (var index = 0; index < 7; index++) {
                var cell = TheDatepicker.HtmlHelper_.createTableCell_();
                var cellButton = this.createTableCellButtonElement_(viewModel);
                var cellContent = this.createTableCellContentElement_(viewModel);
                cells.push(cell);
                cellsButtons.push(cellButton);
                cellsContents.push(cellContent);
                cell.appendChild(cellButton);
                cellButton.appendChild(cellContent);
            }
            this.daysElements_.push(cells);
            this.daysButtonsElements_.push(cellsButtons);
            this.daysContentsElements_.push(cellsContents);
            return TheDatepicker.HtmlHelper_.createTableRow_('week', cells);
        };
        Template_.prototype.updateDayElement_ = function (viewModel, dayElement, dayButtonElement, dayContentElement, day) {
            dayButtonElement.day = day;
            dayElement.setAttribute('data-date', day.getFormatted());
            dayElement.className = '';
            TheDatepicker.HtmlHelper_.addClass_(dayElement, 'cell', this.options_);
            this.options_.updateCellStructure_(dayContentElement, day);
            if (!day.isVisible) {
                dayButtonElement.removeAttribute('href');
                dayButtonElement.style.visibility = 'hidden';
                return;
            }
            TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day', this.options_);
            if (day.isToday) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--today', this.options_);
            }
            if (day.isPast) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--past', this.options_);
            }
            if (day.isWeekend) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--weekend', this.options_);
            }
            if (!day.isAvailable) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--unavailable', this.options_);
            }
            if (!day.isInCurrentMonth) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--outside', this.options_);
            }
            if (day.isHighlighted) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--highlighted', this.options_);
            }
            if (day.isSelected) {
                TheDatepicker.HtmlHelper_.addClass_(dayElement, 'day--selected', this.options_);
            }
            var customClasses = this.options_.getCellClasses(day);
            for (var index = 0; index < customClasses.length; index++) {
                dayElement.className += ' ' + customClasses[index];
            }
            dayButtonElement.style.visibility = 'visible';
            if (day.isAvailable) {
                dayButtonElement.href = '#';
            }
            else {
                dayButtonElement.removeAttribute('href');
            }
            if (day.isFocused) {
                dayButtonElement.focus();
            }
        };
        Template_.prototype.createTableCellButtonElement_ = function (viewModel) {
            var _this = this;
            var cellButton = TheDatepicker.HtmlHelper_.createAnchor_(function (event) {
                var previous = viewModel.selectedDate_;
                var isSelected = viewModel.selectDay_(event, cellButton.day, false, true, true);
                if (_this.options_.isHiddenOnSelect() && (isSelected || (previous && cellButton.day.isEqualToDate(previous)))) {
                    viewModel.close_(event);
                }
            }, this.options_);
            TheDatepicker.HtmlHelper_.addClass_(cellButton, 'day-button', this.options_);
            cellButton.onfocus = function (event) {
                viewModel.highlightDay_(event || window.event, cellButton.day);
            };
            cellButton.onmouseenter = function (event) {
                if (_this.options_.getBeforeFocusListeners().length > 0 || _this.options_.getFocusListeners().length > 0) {
                    viewModel.highlightDay_(event || window.event, cellButton.day, false, false);
                }
                else {
                    viewModel.cancelHighlight_(event || window.event);
                }
            };
            cellButton.onmouseleave = function (event) {
                viewModel.cancelHighlight_(event || window.event);
            };
            return cellButton;
        };
        Template_.prototype.createTableCellContentElement_ = function (viewModel) {
            var cellContent = this.options_.getCellStructure_();
            TheDatepicker.HtmlHelper_.addClass_(cellContent, 'day-content', this.options_);
            return cellContent;
        };
        Template_.prototype.slideMonth_ = function (viewModel, event, directionForward) {
            var _this = this;
            var canGo = directionForward ? viewModel.canGoForward_() : viewModel.canGoBack_();
            if (!canGo) {
                return;
            }
            var change = function () {
                if (directionForward) {
                    viewModel.goForward_(event);
                }
                else {
                    viewModel.goBack_(event);
                }
            };
            if (!this.options_.isMonthChangeAnimated() || !TheDatepicker.Helper_.isCssAnimationSupported_()) {
                change();
                return;
            }
            var prefix = 'the-datepicker-';
            var animationOut = directionForward
                ? 'fade-out-left'
                : 'fade-out-right';
            var animationIn = directionForward
                ? 'fade-in-right'
                : 'fade-in-left';
            var resetBody = function () {
                _this.bodyElement_.className = '';
                TheDatepicker.HtmlHelper_.addClass_(_this.bodyElement_, 'body', _this.options_);
            };
            var animate = function (className) {
                _this.bodyElement_.className += ' ' + prefix + 'animated ' + prefix + className;
            };
            var listenerRemover;
            var timeoutId = window.setTimeout(function () {
                listenerRemover();
                change();
            }, 400);
            listenerRemover = TheDatepicker.Helper_.addEventListener_(this.bodyElement_, TheDatepicker.ListenerType_.AnimationEnd, function (event) {
                change();
                listenerRemover();
                resetBody();
                animate(animationIn);
                listenerRemover = TheDatepicker.Helper_.addEventListener_(_this.bodyElement_, TheDatepicker.ListenerType_.AnimationEnd, function (event) {
                    window.clearTimeout(timeoutId);
                    listenerRemover();
                    resetBody();
                });
            });
            resetBody();
            animate(animationOut);
        };
        Template_.prototype.translateMonth_ = function (monthNumber) {
            return this.options_.isMonthShort()
                ? this.options_.translator.translateMonthShort(monthNumber)
                : this.options_.translator.translateMonth(monthNumber);
        };
        Template_.prototype.addTitle_ = function (element, titleName) {
            var title = this.options_.translator.translateTitle(titleName);
            if (title !== '') {
                element.title = title;
                if (this.options_.isAriaIncluded()) {
                    element.setAttribute('aria-label', title);
                }
            }
        };
        return Template_;
    }());
    TheDatepicker.Template_ = Template_;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var TitleName;
    (function (TitleName) {
        TitleName[TitleName["GoBack"] = 0] = "GoBack";
        TitleName[TitleName["GoForward"] = 1] = "GoForward";
        TitleName[TitleName["Close"] = 2] = "Close";
        TitleName[TitleName["Reset"] = 3] = "Reset";
        TitleName[TitleName["Deselect"] = 4] = "Deselect";
        TitleName[TitleName["Month"] = 5] = "Month";
        TitleName[TitleName["Year"] = 6] = "Year";
    })(TitleName = TheDatepicker.TitleName || (TheDatepicker.TitleName = {}));
    var Translator = (function () {
        function Translator() {
            var _a;
            this.dayOfWeekFullTranslations_ = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            this.dayOfWeekTranslations_ = [
                'Su',
                'Mo',
                'Tu',
                'We',
                'Th',
                'Fr',
                'Sa',
            ];
            this.monthTranslations_ = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            this.monthShortTranslations_ = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            this.titles_ = (_a = {},
                _a[TitleName.GoBack] = 'Go to previous month',
                _a[TitleName.GoForward] = 'Go to next month',
                _a[TitleName.Close] = 'Close calendar',
                _a[TitleName.Reset] = 'Reset calendar',
                _a[TitleName.Deselect] = 'Deselect date',
                _a[TitleName.Month] = 'Month selection',
                _a[TitleName.Year] = 'Year selection',
                _a);
        }
        Translator.prototype.setDayOfWeekTranslation = function (dayOfWeek, translation) {
            this.dayOfWeekTranslations_[TheDatepicker.Helper_.checkNumber_('Day of week', dayOfWeek, 0, 6)] = TheDatepicker.Helper_.checkString_('Translation', translation, true);
        };
        Translator.prototype.setDayOfWeekFullTranslation = function (dayOfWeek, translation) {
            this.dayOfWeekFullTranslations_[TheDatepicker.Helper_.checkNumber_('Day of week', dayOfWeek, 0, 6)] = TheDatepicker.Helper_.checkString_('Translation', translation, true);
        };
        Translator.prototype.setMonthTranslation = function (month, translation) {
            this.monthTranslations_[TheDatepicker.Helper_.checkNumber_('Month', month, 0, 11)] = TheDatepicker.Helper_.checkString_('Translation', translation, true);
        };
        Translator.prototype.setMonthShortTranslation = function (month, translation) {
            this.monthShortTranslations_[TheDatepicker.Helper_.checkNumber_('Month', month, 0, 11)] = TheDatepicker.Helper_.checkString_('Translation', translation, true);
        };
        Translator.prototype.setTitleTranslation = function (titleName, translation) {
            this.titles_[titleName] = TheDatepicker.Helper_.checkString_('Translation', translation);
        };
        Translator.prototype.translateDayOfWeek = function (dayOfWeek) {
            return this.dayOfWeekTranslations_[dayOfWeek];
        };
        Translator.prototype.translateDayOfWeekFull = function (dayOfWeek) {
            return this.dayOfWeekFullTranslations_[dayOfWeek];
        };
        Translator.prototype.translateMonth = function (month) {
            return this.monthTranslations_[month];
        };
        Translator.prototype.translateMonthShort = function (month) {
            return this.monthShortTranslations_[month];
        };
        Translator.prototype.translateTitle = function (titleName) {
            var translation = this.titles_[titleName];
            if (typeof translation !== 'string') {
                throw new Error('Unknown title ' + titleName);
            }
            return translation;
        };
        return Translator;
    }());
    TheDatepicker.Translator = Translator;
})(TheDatepicker || (TheDatepicker = {}));
var TheDatepicker;
(function (TheDatepicker) {
    var MoveDirection_;
    (function (MoveDirection_) {
        MoveDirection_[MoveDirection_["Left"] = -1] = "Left";
        MoveDirection_[MoveDirection_["Up"] = -7] = "Up";
        MoveDirection_[MoveDirection_["Right"] = 1] = "Right";
        MoveDirection_[MoveDirection_["Down"] = 7] = "Down";
    })(MoveDirection_ = TheDatepicker.MoveDirection_ || (TheDatepicker.MoveDirection_ = {}));
    var ViewModel_ = (function () {
        function ViewModel_(options_, datepicker_, dateConverter_) {
            this.options_ = options_;
            this.datepicker_ = datepicker_;
            this.dateConverter_ = dateConverter_;
            this.selectedDate_ = null;
            this.currentMonth_ = null;
            this.outsideDates_ = null;
            this.highlightedDay_ = null;
            this.isHighlightedDayFocused_ = false;
            this.active_ = false;
            this.template_ = new TheDatepicker.Template_(this.options_, datepicker_.container, !!datepicker_.input);
        }
        ViewModel_.prototype.render_ = function () {
            if (this.datepicker_.isDestroyed() || this.selectPossibleDate_()) {
                return;
            }
            var correctMonth = this.options_.correctMonth(this.getCurrentMonth_());
            if (this.goToMonth_(null, correctMonth)) {
                return;
            }
            this.template_.render_(this);
            this.datepicker_.updateInput_();
        };
        ViewModel_.prototype.setActive_ = function (event, value) {
            if (this.active_ === value) {
                return true;
            }
            if ((value && !this.triggerOnBeforeOpen_(event))
                || (!value && !this.triggerOnBeforeClose_(event))) {
                return false;
            }
            this.active_ = value;
            if (this.options_.isHiddenOnBlur()) {
                this.render_();
            }
            if (value) {
                this.triggerOnOpen_(event);
            }
            else {
                this.triggerOnClose_(event);
            }
            return true;
        };
        ViewModel_.prototype.isActive_ = function () {
            return this.active_;
        };
        ViewModel_.prototype.close_ = function (event) {
            return this.datepicker_.close(event);
        };
        ViewModel_.prototype.getCurrentMonth_ = function () {
            if (!this.currentMonth_) {
                this.setCurrentMonth_(this.options_.getInitialMonth());
            }
            return this.currentMonth_;
        };
        ViewModel_.prototype.canGoBack_ = function () {
            var newMonth = new Date(this.getCurrentMonth_().getTime());
            newMonth.setMonth(newMonth.getMonth() - 1);
            return this.canGoToMonth_(newMonth);
        };
        ViewModel_.prototype.canGoForward_ = function () {
            var newMonth = new Date(this.getCurrentMonth_().getTime());
            newMonth.setMonth(newMonth.getMonth() + 1);
            return this.canGoToMonth_(newMonth);
        };
        ViewModel_.prototype.canGoToMonth_ = function (month) {
            if (!TheDatepicker.Helper_.isValidDate_(month)) {
                return false;
            }
            return this.options_.isMonthInValidity(month);
        };
        ViewModel_.prototype.goBack_ = function (event) {
            var newMonth = new Date(this.getCurrentMonth_().getTime());
            newMonth.setMonth(newMonth.getMonth() - 1);
            return this.goToMonth_(event, newMonth);
        };
        ViewModel_.prototype.goForward_ = function (event) {
            var newMonth = new Date(this.getCurrentMonth_().getTime());
            newMonth.setMonth(newMonth.getMonth() + 1);
            return this.goToMonth_(event, newMonth);
        };
        ViewModel_.prototype.goToMonth_ = function (event, month, doCancelHighlight) {
            if (doCancelHighlight === void 0) { doCancelHighlight = true; }
            month = TheDatepicker.Helper_.resetTime_(new Date(month.getTime()));
            month.setDate(1);
            if (month.getTime() === this.getCurrentMonth_().getTime() || !this.canGoToMonth_(month)) {
                return false;
            }
            if (!this.triggerOnBeforeMonthChange_(event, month, this.currentMonth_)) {
                return false;
            }
            this.setCurrentMonth_(month);
            if (!doCancelHighlight || !this.cancelHighlight_(event)) {
                this.render_();
            }
            this.triggerOnMonthChange_(event, month, this.currentMonth_);
            return true;
        };
        ViewModel_.prototype.reset_ = function (event) {
            var isMonthChanged = this.goToMonth_(event, this.options_.getInitialMonth());
            var isDaySelected = this.selectInitialDate_(event);
            return isMonthChanged || isDaySelected;
        };
        ViewModel_.prototype.selectDay_ = function (event, date, doUpdateMonth, doHighlight, canToggle) {
            if (doUpdateMonth === void 0) { doUpdateMonth = true; }
            if (doHighlight === void 0) { doHighlight = false; }
            if (canToggle === void 0) { canToggle = false; }
            if (!date) {
                return this.cancelSelection_(event);
            }
            var day;
            if (date instanceof TheDatepicker.Day) {
                day = date;
                date = day.getDate();
            }
            else {
                day = this.createDay_(date);
            }
            if (!day.isAvailable) {
                return false;
            }
            if (day.isEqualToDate(this.selectedDate_)) {
                if (canToggle && this.options_.hasToggleSelection()) {
                    return this.cancelSelection_(event);
                }
                return false;
            }
            var previousDay = this.selectedDate_ ? this.createDay_(this.selectedDate_) : null;
            if (!this.triggerOnBeforeSelect_(event, day, previousDay)) {
                return false;
            }
            this.selectedDate_ = day.getDate();
            if (doHighlight) {
                this.highlightDay_(event, day);
            }
            if (!doUpdateMonth || !this.goToMonth_(event, date)) {
                this.render_();
            }
            this.triggerOnSelect_(event, day, previousDay);
            return true;
        };
        ViewModel_.prototype.selectNearestDate_ = function (event, date) {
            return this.selectDay_(event, this.options_.findNearestAvailableDate(date));
        };
        ViewModel_.prototype.selectPossibleDate_ = function () {
            try {
                return this.selectDay_(null, this.options_.findPossibleAvailableDate(this.selectedDate_), false);
            }
            catch (error) {
                if (!(error instanceof TheDatepicker.AvailableDateNotFoundException)) {
                    throw error;
                }
                return this.cancelSelection_(null, true);
            }
        };
        ViewModel_.prototype.selectInitialDate_ = function (event) {
            try {
                return this.selectDay_(event, this.options_.getInitialDate(), false);
            }
            catch (error) {
                if (!(error instanceof TheDatepicker.AvailableDateNotFoundException)) {
                    throw error;
                }
                return this.cancelSelection_(null, true);
            }
        };
        ViewModel_.prototype.highlightDay_ = function (event, day, doUpdateMonth, doFocus) {
            if (doUpdateMonth === void 0) { doUpdateMonth = false; }
            if (doFocus === void 0) { doFocus = true; }
            if (!day.isAvailable) {
                return false;
            }
            if (day.isEqualToDay(this.highlightedDay_)) {
                return false;
            }
            var previousDay = this.highlightedDay_;
            if (!this.triggerOnBeforeFocus_(event, day, previousDay)) {
                return false;
            }
            this.highlightedDay_ = day;
            if (doFocus) {
                this.isHighlightedDayFocused_ = true;
            }
            var date = day.getDate();
            if (!doUpdateMonth || !this.goToMonth_(event, date, false)) {
                this.render_();
            }
            this.triggerOnFocus_(event, day, previousDay);
            return true;
        };
        ViewModel_.prototype.highlightFirstAvailableDay_ = function (event) {
            var maxDate = this.options_.getMaxDate_();
            var day = this.createDay_(new Date(this.getCurrentMonth_().getTime()));
            while (!day.isAvailable) {
                var sibling = day.getSibling();
                if (sibling.dayNumber === 1) {
                    break;
                }
                if (sibling.getDate().getTime() > maxDate.getTime()) {
                    break;
                }
                day = sibling;
            }
            return this.highlightDay_(event, day);
        };
        ViewModel_.prototype.highlightSiblingDay_ = function (event, day, direction) {
            var newDay = day;
            var maxLoops = 1000;
            do {
                newDay = newDay.getSibling(direction);
                if (!newDay.isInValidity) {
                    break;
                }
                maxLoops--;
            } while (!newDay.isAvailable && maxLoops > 0);
            return this.highlightDay_(event, newDay, true);
        };
        ViewModel_.prototype.cancelSelection_ = function (event, force) {
            if (force === void 0) { force = false; }
            if (!this.options_.isAllowedEmpty() && !force) {
                return false;
            }
            if (!this.selectedDate_) {
                return false;
            }
            var previousDay = this.createDay_(this.selectedDate_);
            if (!this.triggerOnBeforeSelect_(event, null, previousDay)) {
                return false;
            }
            this.selectedDate_ = null;
            this.render_();
            this.triggerOnSelect_(event, null, previousDay);
            return true;
        };
        ViewModel_.prototype.cancelHighlight_ = function (event) {
            if (!this.highlightedDay_) {
                return false;
            }
            var previousDay = this.highlightedDay_;
            if (!this.triggerOnBeforeFocus_(event, null, previousDay)) {
                return false;
            }
            this.highlightedDay_ = null;
            this.render_();
            this.triggerOnFocus_(event, null, previousDay);
            return true;
        };
        ViewModel_.prototype.getWeekDays_ = function () {
            var weekDays = [];
            for (var day = 0; day < 7; day++) {
                weekDays.push((this.options_.getFirstDayOfWeek() + day) % 7);
            }
            return weekDays;
        };
        ViewModel_.prototype.getWeeks_ = function () {
            var days = [];
            var currentMonth = this.getCurrentMonth_();
            var outsideDates = this.getOutsideDates_();
            for (var index = 0; index < outsideDates.prepend.length; index++) {
                var day = this.createDay_(outsideDates.prepend[index]);
                days.push(day);
            }
            var lastDateOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            var monthDaysCount = lastDateOfMonth.getDate();
            for (var date = 1; date <= monthDaysCount; date++) {
                days.push(this.createDay_(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)));
            }
            for (var index = 0; index < outsideDates.append.length; index++) {
                var day = this.createDay_(outsideDates.append[index]);
                days.push(day);
            }
            var weeks = [];
            for (var i = 0; i < days.length; i += 7) {
                weeks.push(days.slice(i, i + 7));
            }
            return weeks;
        };
        ViewModel_.prototype.triggerKeyPress_ = function (event) {
            if (TheDatepicker.Helper_.inArray_([TheDatepicker.KeyCode_.Left, TheDatepicker.KeyCode_.Up, TheDatepicker.KeyCode_.Right, TheDatepicker.KeyCode_.Down], event.keyCode)) {
                TheDatepicker.Helper_.preventDefault_(event);
                if (this.highlightedDay_) {
                    this.highlightSiblingDay_(event, this.highlightedDay_, this.translateKeyCodeToMoveDirection_(event.keyCode));
                }
                else if (this.selectedDate_
                    && this.selectedDate_.getFullYear() === this.getCurrentMonth_().getFullYear()
                    && this.selectedDate_.getMonth() === this.getCurrentMonth_().getMonth()) {
                    this.highlightSiblingDay_(event, this.createDay_(this.selectedDate_), this.translateKeyCodeToMoveDirection_(event.keyCode));
                }
                else {
                    this.highlightFirstAvailableDay_(event);
                }
            }
            else if (event.keyCode === TheDatepicker.KeyCode_.Esc && this.options_.isClosedOnEscPress()) {
                this.datepicker_.close(event);
            }
        };
        ViewModel_.prototype.createDay_ = function (date) {
            var _this = this;
            date = TheDatepicker.Helper_.resetTime_(new Date(date.getTime()));
            var today = this.options_.getToday();
            var currentMonth = this.getCurrentMonth_();
            var day = new TheDatepicker.Day(date, function (date) {
                return _this.createDay_(date);
            }, function (date) {
                return _this.dateConverter_.formatDate_(_this.options_.getInputFormat(), date);
            });
            day.isToday = date.getTime() === today.getTime();
            day.isPast = date.getTime() < today.getTime();
            day.isInValidity = this.options_.isDateInValidity(date);
            day.isAvailable = day.isInValidity && this.options_.isDateAvailable(date);
            day.isInCurrentMonth = date.getMonth() === currentMonth.getMonth();
            if (day.isInCurrentMonth) {
                day.isVisible = true;
            }
            else if (this.options_.areDaysOutOfMonthVisible()) {
                var outsideDates = this.getOutsideDates_();
                var pendants = outsideDates.prepend.concat(outsideDates.append);
                for (var index = 0; index < pendants.length; index++) {
                    if (date.getTime() === pendants[index].getTime()) {
                        day.isVisible = true;
                        break;
                    }
                }
            }
            if (day.isAvailable) {
                if (day.isEqualToDate(this.selectedDate_)) {
                    day.isSelected = true;
                }
                if (day.isEqualToDay(this.highlightedDay_)) {
                    day.isHighlighted = true;
                    if (this.isHighlightedDayFocused_) {
                        day.isFocused = true;
                        this.isHighlightedDayFocused_ = false;
                    }
                }
            }
            this.options_.modifyDay(day);
            return day;
        };
        ViewModel_.prototype.triggerOnBeforeSelect_ = function (event, day, previousDay) {
            var _this = this;
            return this.options_.triggerEvent_(TheDatepicker.EventType_.BeforeSelect, function (listener) {
                return listener.call(_this.datepicker_, event, day, previousDay);
            });
        };
        ViewModel_.prototype.triggerOnSelect_ = function (event, day, previousDay) {
            var _this = this;
            this.options_.triggerEvent_(TheDatepicker.EventType_.Select, function (listener) {
                return listener.call(_this.datepicker_, event, day, previousDay);
            });
        };
        ViewModel_.prototype.triggerOnBeforeOpen_ = function (event) {
            var _this = this;
            return this.options_.triggerEvent_(TheDatepicker.EventType_.BeforeOpen, function (listener) {
                return listener.call(_this.datepicker_, event, true);
            });
        };
        ViewModel_.prototype.triggerOnOpen_ = function (event) {
            var _this = this;
            this.options_.triggerEvent_(TheDatepicker.EventType_.Open, function (listener) {
                return listener.call(_this.datepicker_, event, true);
            });
        };
        ViewModel_.prototype.triggerOnBeforeClose_ = function (event) {
            var _this = this;
            return this.options_.triggerEvent_(TheDatepicker.EventType_.BeforeClose, function (listener) {
                return listener.call(_this.datepicker_, event, false);
            });
        };
        ViewModel_.prototype.triggerOnClose_ = function (event) {
            var _this = this;
            this.options_.triggerEvent_(TheDatepicker.EventType_.Close, function (listener) {
                return listener.call(_this.datepicker_, event, false);
            });
        };
        ViewModel_.prototype.triggerOnBeforeMonthChange_ = function (event, month, previousMonth) {
            var _this = this;
            return this.options_.triggerEvent_(TheDatepicker.EventType_.BeforeMonthChange, function (listener) {
                return listener.call(_this.datepicker_, event, month, previousMonth);
            });
        };
        ViewModel_.prototype.triggerOnMonthChange_ = function (event, month, previousMonth) {
            var _this = this;
            this.options_.triggerEvent_(TheDatepicker.EventType_.MonthChange, function (listener) {
                return listener.call(_this.datepicker_, event, month, previousMonth);
            });
        };
        ViewModel_.prototype.triggerOnBeforeFocus_ = function (event, day, previousDay) {
            var _this = this;
            return this.options_.triggerEvent_(TheDatepicker.EventType_.BeforeFocus, function (listener) {
                return listener.call(_this.datepicker_, event, day, previousDay);
            });
        };
        ViewModel_.prototype.triggerOnFocus_ = function (event, day, previousDay) {
            var _this = this;
            this.options_.triggerEvent_(TheDatepicker.EventType_.Focus, function (listener) {
                return listener.call(_this.datepicker_, event, day, previousDay);
            });
        };
        ViewModel_.prototype.setCurrentMonth_ = function (month) {
            this.currentMonth_ = month;
            this.outsideDates_ = null;
        };
        ViewModel_.prototype.getOutsideDates_ = function () {
            if (this.outsideDates_) {
                return this.outsideDates_;
            }
            var currentMonth = this.getCurrentMonth_();
            var firstDayOfWeek = this.options_.getFirstDayOfWeek();
            var firstDateOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            var lastMonthDaysCount = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)).getDate();
            var prependDaysCount = (firstDateOfMonth.getDay() - firstDayOfWeek + 7) % 7;
            var prepend = [];
            for (var date = lastMonthDaysCount - prependDaysCount + 1; date <= lastMonthDaysCount; date++) {
                prepend.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, date));
            }
            var lastDateOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            var appendDaysCount = 6 - ((lastDateOfMonth.getDay() - firstDayOfWeek + 7) % 7);
            var append = [];
            for (var date = 1; date <= appendDaysCount; date++) {
                append.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, date));
            }
            if (this.options_.hasFixedRowsCount()) {
                var monthDaysCount = lastDateOfMonth.getDate();
                for (var date = appendDaysCount + 1; prependDaysCount + monthDaysCount + append.length < 6 * 7; date++) {
                    append.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, date));
                }
            }
            this.outsideDates_ = {
                prepend: prepend,
                append: append
            };
            return this.outsideDates_;
        };
        ViewModel_.prototype.translateKeyCodeToMoveDirection_ = function (key) {
            switch (key) {
                case TheDatepicker.KeyCode_.Left:
                    return MoveDirection_.Left;
                case TheDatepicker.KeyCode_.Up:
                    return MoveDirection_.Up;
                case TheDatepicker.KeyCode_.Right:
                    return MoveDirection_.Right;
                case TheDatepicker.KeyCode_.Down:
                    return MoveDirection_.Down;
                default:
                    throw new Error('Invalid key code: ' + key);
            }
        };
        return ViewModel_;
    }());
    TheDatepicker.ViewModel_ = ViewModel_;
})(TheDatepicker || (TheDatepicker = {}));
