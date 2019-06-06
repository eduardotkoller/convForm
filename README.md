### Note: I will not maintain this anymore. I unfortunately don't have enough time to work on new features and bugfixes.
I started this as a side project and it brought itself to life, with many people seeing different uses to this, in ways completely different from what it was originally supposed to do. I may sometime in the uncertain future re-do this from the ground up to attain to those possibilities, but currently I don't have enough time to work on this, sorry. If you want to help with anything, feel free to open pull requests.

# convForm

A plugin that transforms a form into a interative chat.

#### [Demo](https://eduardotkoller.github.io/convForm)

Features:

* Transform any input, select (multi or not) to questions on a interative chat
* regex patterns
* random question from within options
* Fork conversation based on answer
* Access previous answers to use on questions
* Messages that doesn't expect answer
* Dynamically create new questions (like using an API)! [Demo](https://eduardotkoller.github.io/convForm/api_example.html) - please see the example code inside the html to understand how it works

To build the chat, just wrap the form inside an element, and call .convform() on it's jquery selector.

Example:

```javascript
$(function(){
  var convForm = $('.my-conv-form-wrapper').convform();
});
```


For the plugin to know which question to ask, every input and select must have a data-conv-question attribute to it. Example:

```html
<select data-conv-question="Hello! I'm a bot created from a HTML form. Can I show you some features?">
	<option value="yes">Yes</option>
	<option value="sure">Sure!</option>
</select>
```


### Pick a question

If you want, you can write more than one question for each tag, using pipe | to separate them. The plugin will randomly choose one to use each time the chat is generated. Example:

```html
<input type="text" name="name" data-conv-question="Alright! First, tell me your full name, please.|Okay! Please, tell me your name first.">
```


### Regex patterns

You can use regex patterns on inputs, just use the data-pattern attribute on the tag. When the user types an answer, if it doesn't fit the pattern, he can't send it and the input color turns red. Example:

```html
<input data-conv-question="Type in your e-mail" data-pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" type="email" name="email">
```

### Forking the conversation

You can fork the conversation and ask specific questions based on user's answer. This only works when forking from selects.

To do this, you need to put a div tag after the question you want to fork the conversation from, with a data-conv-fork tag with the select's name on it.

Inside that div, you need to create div tags with data-conv-case attribute referencing the answer that will fork the conversation to it's child elements.

```html
<select name="programmer" data-conv-question="So, are you a programmer? (this question will fork the conversation based on your answer)">
	<option value="yes">Yes</option>
	<option value="no">No</option>
</select>
<div data-conv-fork="programmer">
	<div data-conv-case="yes">
	 	<input type="text" data-conv-question="A fellow programmer! Cool." data-no-answer="true">
	</div>
	<div data-conv-case="no">
		<select name="thought" data-conv-question="Have you ever thought about learning? Programming is fun!">
			<option value="yes">Yes</option>
			<option value="no">No..</option>
		</select>
	</div>
</div>
```

### Referencing previous answers

To use user's answers on questions, you can use {inputname} inside a data-conv-question tag, in which inputname references the question you need the answer from. If you want, you can get specific words from the answer using : selector (0-indexed). For example, when you need the user's first name, you can use {name}:0, and the plugin will get the first word from the "name" question's answer. Example:

```html
<input type="text" data-conv-question="Howdy, {name}:0! It's a pleasure to meet you. How's your day?">
```

### Questions that doesn't expect answer (acts like messages)

You can put messages in the chat flow. They are questions that doesn't expect any answer from the user, so the plugin will go on to the next question instantly. To do this, put a data-no-answer="true" attribute on an input tag. Example:

```html
<input type="text" data-conv-question="A fellow programmer! Cool." data-no-answer="true">
```

### Callbacks

You can use custom functions to be called when a user clicks on an answer from a select, or at the end of the question (If the question expects an answer, the callback will be called after user input. If it doesn't, callback will be called after printing the message.). To do this, simply put the name of the function to be called in the "data-callback" attribute of the option tag, or in the input tag:

```html
<select data-conv-question="Selects also support callback functions. For example, try one of these:">
		<option value="google" data-callback="google">Google</option>
		<option value="bing" data-callback="bing">Bing</option>
</select>
<script>
	function google(stateWrapper, ready) {
		window.open("https://google.com");
		ready();
	}
	function bing(stateWrapper, ready) {
		window.open("https://bing.com");
		ready();
	}
</script>
```

Callback functions are called with parameters `stateWrapper` and a callback function `ready`. State wrapper is the convForm object, and ready is a function that you MUST call to proceed to the next question.

### Options

You can add an options object as a parameter to the convForm function, containing:

* ```placeHolder```: the placeholder you want to appear on the user's input
* ```typeInputUi```: 'input' or 'textarea', to choose the type of the html element to use as the user's input
* ```timeOutFirstQuestion```: time in ms as the duration for the load-up animation before the first question
* ```buttonClassStyle```: class for the user's submit answer button
* ```eventList```: an object with functions to be called at specific times, the only supported at the moment are ```onSubmitForm``` (function is called with the convState as a parameter) and ```onInputSubmit``` (function called with the convState as the first parameter, and a ready callback function to print the next question as the second parameter)
* ```formIdName```: html id for the form
* ```inputIdName```: html id for the user's input
* ```loadSpinnerVisible```: class for the loadSpinner
* ```selectInputStyle```: `show` (default), `disable` or `hide` -- tells the plugin how to handle the input field when a question is a `select`.
* ```selectInputDisabledText```: The text to show on the input on select questions in case the `selectInputStyle` is set to `disable`.


```javascript
$(function(){
  var convForm = $('.my-conv-form-wrapper').convform({
    eventList: {
        onSubmitForm: function(convState) {
            console.log('The form is being submitted!');
            convState.form.submit();
        }
    }
  });
});
```

Beware that the callback functions are called inside the `onInputSubmit` function. If you are changing this event function, you shouldn't need to use callback functions in the HTML tags, but if you for some reason do need them, besure to call them here using `window[convState.current.input.callback](convState, readyCallback);`


#### Stuff used to make this:

* [Jack Moore's autosize plugin](https://github.com/jackmoore/autosize), used to autoresize the user input
