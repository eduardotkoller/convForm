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

To build the chat, just wrap the form inside an element, and call .convform() on it's jquery selector. The function requires a placeholder for the user input.

Example:

```javascript
$(function(){
  var convForm = $('.conv-form-wrapper').convform("Write here...");
});
```


For the plugin to know which question to ask, every input and select must have a conv-question attribute to it. Example:

```html
<select conv-question="Hello! I'm a bot created from a HTML form. Can I show you some features?">
	<option value="yes">Yes</option>
	<option value="sure">Sure!</option>
</select>
```


### Pick a question

If you want, you can write more than one question for each tag, using pipe | to separate them. The plugin will randomly choose one to use each time the chat is generated. Example:

```html
<input type="text" name="name" conv-question="Alright! First, tell me your full name, please.|Okay! Please, tell me your name first.">
```


### Regex patterns

You can use regex patterns on inputs, just use the pattern attribute on the tag. When the user types an answer, if it doesn't fit the pattern, he can't send it and the input color turns red. Example:

```html
<input conv-question="Type in your e-mail" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" type="email" name="email">
```

### Forking the conversation

You can fork the conversation and ask specific questions based on user's answer. This only works when forking from selects.

To do this, you need to put a div tag after the question you want to fork the conversation from, with a conv-fork tag with the select's name on it.

Inside that div, you need to create div tags with conv-case attribute referencing the answer that will fork the conversation to it's child elements.

```html
<select name="programmer" conv-question="So, are you a programmer? (this question will fork the conversation based on your answer)">
	<option value="yes">Yes</option>
	<option value="no">No</option>
</select>
<div conv-fork="programmer">
	<div conv-case="yes">
	 	<input type="text" conv-question="A fellow programmer! Cool." no-answer="true">
	</div>
	<div conv-case="no">
		<select name="thought" conv-question="Have you ever thought about learning? Programming is fun!">
			<option value="yes">Yes</option>
			<option value="no">No..</option>
		</select>
	</div>
</div>
```

### Referencing previous answers

To use user's answers on questions, you can use {inputname} inside a conv-question tag, in which inputname references the question you need the answer from. If you want, you can get specific words from the answer using : selector (0-indexed). For example, when you need the user's first name, you can use {name}:0, and the plugin will get the first word from the "name" question's answer. Example:

```html
<input type="text" conv-question="Howdy, {name}:0! It's a pleasure to meet you. How's your day?">
```

### Questions that doesn't expect answer (acts like messages)

You can put messages in the chat flow. They are questions that doesn't expect any answer from the user, so the plugin will go on to the next question instantly. To do this, put a no-answer="true" attribute on an input tag. Example:

```html
<input type="text" conv-question="A fellow programmer! Cool." no-answer="true">
```

### Callbacks

You can use custom functions to be called when a user clicks on an answer from a select, or at the end of the question (If the question expects an answer, the callback will be called after user input. If it doesn't, callback will be called after printing the message.). To do this, simply put the name of the function to be called in the "callback" attribute of the option tag, or in the input tag:

```html
<select conv-question="Selects also support callback functions. For example, try one of these:">
		<option value="google" callback="google">Google</option>
		<option value="bing" callback="bing">Bing</option>
</select>
<script>
	function google() {
		window.open("https://google.com");
	}
	function bing() {
		window.open("https://bing.com");
	}
</script>
```



#### Stuff used to make this:

* [Jack Moore's autosize plugin](https://github.com/jackmoore/autosize), used to autoresize the user input
