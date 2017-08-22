function SingleConvState(input){
    this.input = input;
    this.next = false;
    return this;
}
SingleConvState.prototype.hasNext = function(){
    return this.next;
};
function ConvState(wrapper, SingleConvState, form) {
    this.form = form;
    this.wrapper = wrapper;
    this.current = SingleConvState;
    this.answers = {};
    this.scrollDown = function() {
        $(this.wrapper).find('#messages').stop().animate({scrollTop: $(this.wrapper).find('#messages')[0].scrollHeight}, 600);
    }.bind(this);
}
ConvState.prototype.next = function(){
    if(this.current.hasNext()){
        this.current = this.current.next;
        if(this.current.input.hasOwnProperty('fork') && this.current.input.hasOwnProperty('case')){
            if(this.answers.hasOwnProperty(this.current.input.fork) && this.answers[this.current.input.fork].value != this.current.input.case) {
                return this.next();
            }
            if(!this.answers.hasOwnProperty(this.current.input.fork)) {
                return this.next();
            }
        }
        return true;
    } else {
        return false;
    }
};
ConvState.prototype.printQuestion = function(){
    var questions = this.current.input.questions;
    var question = questions[Math.floor(Math.random() * questions.length)]; //get a random question from questions array
    var ansWithin = question.match(/\{(.*?)\}(\:(\d)*)?/g); // searches for string replacements for answers and replaces them with previous aswers (warning: not checking if answer exists)
    for(var key in ansWithin){
        if(ansWithin.hasOwnProperty(key)){
            var ansKey = ansWithin[key].replace(/\{|\}/g, "");
            var ansFinalKey = ansKey;
            var index = false;
            if(ansKey.indexOf(':')!=-1){
                ansFinalKey = ansFinalKey.split(':')[0];
                index = ansKey.split(':')[1];
            }
            if(index!==false){
                var replacement = this.answers[ansFinalKey].text.split(' ');
                if(replacement.length >= index){
                    question = question.replace(ansWithin[key], replacement[index]);
                } else {
                    question = question.replace(ansWithin[key], this.answers[ansFinalKey].text);
                }
            } else {
                question = question.replace(ansWithin[key], this.answers[ansFinalKey].text);
            }
        }
    }
    var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
    setTimeout(function(){
        $(this.wrapper).find('#messages').append(messageObj);
        this.scrollDown();
    }.bind(this), 100);
    setTimeout(function(){
        messageObj.html(question);
        messageObj.removeClass('typing').addClass('ready');
        if(this.current.input.type=="select"){
            this.printAnswers(this.current.input.answers, this.current.input.multiple);
        }
        this.scrollDown();
        if(this.current.input.hasOwnProperty('noAnswer')) {
            this.next();
            setTimeout(function(){
                this.printQuestion();
            }.bind(this),200);
        }
        $(this.wrapper).find('#userInput').focus();
    }.bind(this), 500);
};
ConvState.prototype.printAnswers = function(answers, multiple){
    this.wrapper.find('div.options div.option').remove();
    if(multiple){
        for(var i in answers){
            if(answers.hasOwnProperty(i)){
                var option = $('<div class="option">'+answers[i].text+'</div>')
                    .data("answer", answers[i])
                    .click(function(event){
                        var indexOf = this.current.input.selected.indexOf($(event.target).data("answer").value);
                        if(indexOf == -1){
                            this.current.input.selected.push($(event.target).data("answer").value);
                            $(event.target).addClass('selected');
                        } else {
                            this.current.input.selected.splice(indexOf, 1);
                            $(event.target).removeClass('selected');
                        }
                        if(this.current.input.selected.length > 0) {
                            this.wrapper.find('button.submit').addClass('glow');
                        } else {
                            this.wrapper.find('button.submit').removeClass('glow');
                        }
                    }.bind(this));
                this.wrapper.find('div.options').append(option);
                $(window).trigger('dragreset');
            }
        }
    } else {
        for(var i in answers){
            if(answers.hasOwnProperty(i)){
                var option = $('<div class="option">'+answers[i].text+'</div>')
                    .data("answer", answers[i])
                    .click(function(event){
                        this.current.input.selected = $(event.target).data("answer").value;
                        this.answerWith($(event.target).data("answer").text, $(event.target).data("answer"));
                        this.wrapper.find('div.options div.option').remove();
                    }.bind(this));
                if(answers[i].hasOwnProperty('callback')){
                  var callback = answers[i].callback;
                	option.click(function(event){
                		window[this]();
                	}.bind(callback));
                }
                this.wrapper.find('div.options').append(option);
                $(window).trigger('dragreset');
            }
        }
    }
    var diff = $(this.wrapper).find('div.options').height();
    $(this.wrapper).find('#messages').css({paddingBottom: diff});

};
ConvState.prototype.answerWith = function(answerText, answerObject) {
    //console.log('previous answer: ', answerObject);
    //puts answer inside answers array to give questions access to previous answers
    if(this.current.input.hasOwnProperty('name')){
        if(typeof answerObject == 'string') {
            if(this.current.input.type == 'tel')
                answerObject = answerObject.replace(/\s|\(|\)|-/g, "");
            this.answers[this.current.input.name] = {text: answerText, value: answerObject};
            console.log('previous answer: ', answerObject);
        } else {
            this.answers[this.current.input.name] = answerObject;
        }
        if(this.current.input.type == 'select' && !this.current.input.multiple) {
            $(this.current.input.element).val(answerObject.value).change();
        } else {
            $(this.current.input.element).val(answerObject).change();
        }
    }
    //prints answer within messages wrapper
    if(this.current.input.type == 'password')
        answerText = answerText.replace(/./g, '*');
    var message = $('<div class="message from">'+answerText+'</div>');

    //removes options before appending message so scroll animation runs without problems
    $(this.wrapper).find("div.options div.option").remove();


    var diff = $(this.wrapper).find('div.options').height();
    $(this.wrapper).find('#messages').css({paddingBottom: diff});
    $(this.wrapper).find("#userInput").focus();
    setTimeout(function(){
        $(this.wrapper).find("#messages").append(message);
        this.scrollDown();
    }.bind(this), 300);

    $(this.form).append(this.current.input.element);
    //goes to next state and prints question
    if(this.next()){
        setTimeout(function(){
            this.printQuestion();
        }.bind(this), 300);
    } else {
        this.form.submit();
    }
};

(function($){
    $.fn.convform = function(placeholder){
        var wrapper = this;
        /*
        * this will create an array with all inputs, selects and textareas found
        * inside the wrapper, in order of appearance
        */
        var inputs = $(this).find('input, select, textarea').map(function(){
            var input = {};
            if($(this).attr('name'))
                input['name'] = $(this).attr('name').replace(/\[|\]/g, "");
            if($(this).attr('no-answer'))
                input['noAnswer'] = true;
            if($(this).attr('type'))
                input['type'] = $(this).attr('type');
            input['questions'] = $(this).attr('conv-question').split("|");
            if($(this).attr('pattern'))
                input['pattern'] = $(this).attr('pattern');
            if($(this).is('select')) {
                input['type'] = 'select';
                input['answers'] = $(this).find('option').map(function(){
                    var answer = {};
                    answer['text'] = $(this).text();
                    answer['value'] = $(this).val();
		            if($(this).attr('callback'))
		            	answer['callback'] = $(this).attr('callback');
                    return answer;
                }).get();
                if($(this).prop('multiple')){
                    input['multiple'] = true;
                    input['selected'] = [];
                } else {
                    input['multiple'] = false;
                    input['selected'] = "";
                }
            }
            if($(this).parent('div[conv-case]').length) {
                input['case'] = $(this).parent('div[conv-case]').attr('conv-case');
                input['fork'] = $(this).parent('div[conv-case]').parent('div[conv-fork]').attr('conv-fork');
            }
            input['element'] = this;
            $(this).detach();
            return input;
        }).get();
        //hides original form so users cant interact with it
        var form = $(wrapper).find('form').hide();

        //var placeholder = 'Write here...';
        //create a new form for user input
        var inputForm = $('<form id="convForm"><div class="options dragscroll"></div><textarea id="userInput" rows="1" placeholder="'+placeholder+'"></textarea><button type="submit" class="icon2-arrow submit">⯈</button><span class="clear"></span></form>');

        //appends messages wrapper and newly created form
        $(wrapper).append('<div class="wrapper-messages"><div id="messages"></div></div>');
        $(wrapper).append(inputForm);

        //creates new single state with first input
        var singleState = new SingleConvState(inputs[0]);
        //creates new wrapper state with first singlestate as current and gives access to wrapper element
        var state = new ConvState(wrapper, singleState, form);
        //creates all new single states with inputs in order
        for(var i in inputs) {
            if(i != 0 && inputs.hasOwnProperty(i)){
                singleState.next = new SingleConvState(inputs[i]);
                singleState = singleState.next;
            }
        }

        //prints first question
        state.printQuestion();

        //binds enter to answer submit and change event to search for select possible answers
        $(inputForm).find("#userInput").keypress(function(e){
            if(e.which == 13) {
                var input = $(this).val();
                e.preventDefault();
                if(state.current.input.type=="select" && !state.current.input.multiple){
                    var results = state.current.input.answers.filter(function(el){
                        return el.text.toLowerCase().indexOf(input.toLowerCase()) != -1;
                    });
                    if(results.length){
                        state.current.input.selected = results[0];
                        $(this).parent('form').submit();
                    } else {
                        state.wrapper.find('#userInput').addClass('error');
                    }
                } else if(state.current.input.type=="select" && state.current.input.multiple) {
                    if(input.trim() != "") {
                        var results = state.current.input.answers.filter(function(el){
                            return el.text.toLowerCase().indexOf(input.toLowerCase()) != -1;
                        });
                        if(results.length){
                            if(state.current.input.selected.indexOf(results[0].value) == -1){
                                state.current.input.selected.push(results[0].value);
                                state.wrapper.find('#userInput').val("");
                            } else {
                                state.wrapper.find('#userInput').val("");
                            }
                        } else {
                            state.wrapper.find('#userInput').addClass('error');
                        }
                    } else {
                        if(state.current.input.selected.length) {
                            $(this).parent('form').submit();
                        }
                    }
                } else {
                    if(input.trim()!='' && !state.wrapper.find('#userInput').hasClass("error")) {
                        $(this).parent('form').submit();
                    } else {
                        $(state.wrapper).find('#userInput').focus();
                    }
                }
            }
            autosize.update($(state.wrapper).find('#userInput'));
        }).on('input', function(e){
            if(state.current.input.type=="select"){
                var input = $(this).val();
                var results = state.current.input.answers.filter(function(el){
                    return el.text.toLowerCase().indexOf(input.toLowerCase()) != -1;
                });
                if(results.length){
                    state.wrapper.find('#userInput').removeClass('error');
                    state.printAnswers(results, state.current.input.multiple);
                } else {
                    state.wrapper.find('#userInput').addClass('error');
                }
            } else if(state.current.input.hasOwnProperty('pattern')) {
                var reg = new RegExp(state.current.input.pattern, 'i');
                if(reg.test($(this).val())) {
                    state.wrapper.find('#userInput').removeClass('error');
                } else {
                    state.wrapper.find('#userInput').addClass('error');
                }
            }
        });

        $(inputForm).find('button.submit').click(function(e){
            var input = $(state.wrapper).find('#userInput').val();
            e.preventDefault();
            if(state.current.input.type=="select" && !state.current.input.multiple){
                if(input == 'Escreva aqui...') input = '';
                var results = state.current.input.answers.filter(function(el){
                    return el.text.toLowerCase().indexOf(input.toLowerCase()) != -1;
                });
                if(results.length){
                    state.current.input.selected = results[0];
                    $(this).parent('form').submit();
                } else {
                    state.wrapper.find('#userInput').addClass('error');
                }
            } else if(state.current.input.type=="select" && state.current.input.multiple) {
                if(input.trim() != "" && input != 'Escreva aqui...') {
                    var results = state.current.input.answers.filter(function(el){
                        return el.text.toLowerCase().indexOf(input.toLowerCase()) != -1;
                    });
                    if(results.length){
                        if(state.current.input.selected.indexOf(results[0].value) == -1){
                            state.current.input.selected.push(results[0].value);
                            state.wrapper.find('#userInput').val("");
                        } else {
                            state.wrapper.find('#userInput').val("");
                        }
                    } else {
                        state.wrapper.find('#userInput').addClass('error');
                    }
                } else {
                    if(state.current.input.selected.length) {
                        $(this).removeClass('glow');
                        $(this).parent('form').submit();
                    }
                }
            } else {
                if(input.trim() != '' && !state.wrapper.find('#userInput').hasClass("error")){
                    $(this).parent('form').submit();
                } else {
                    $(state.wrapper).find('#userInput').focus();
                }
            }
            autosize.update($(state.wrapper).find('#userInput'));
        });

        //binds form submit to state functions
        $(inputForm).submit(function(e){
            e.preventDefault();
            var answer = $(this).find('#userInput').val();
            $(this).find('#userInput').val("");
            if(state.current.input.type == 'select'){
                if(!state.current.input.multiple){
                    state.answerWith(state.current.input.selected.text, state.current.input.selected);
                } else {
                    state.answerWith(state.current.input.selected.join(', '), state.current.input.selected);
                }
            } else {
                state.answerWith(answer, answer);
            }
        });


        if(typeof autosize == 'function') {
            $textarea = $(state.wrapper).find('#userInput');
            autosize($textarea);
        }

        return state;
    }
})( jQuery );

$(function(){
    //instantiate conversation form on .conv-form-wrapper (default class for plugin);
    var convForm = $('.conv-form-wrapper').convform("Write here...");
});
