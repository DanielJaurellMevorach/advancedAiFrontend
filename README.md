## Getting Started

### Dotenv

Dotenv is a module to externalize configuration, for instance database connection details.
To get this demo up and running, you'll need to create a **.env** file in you root project directory (on the same level as .gitignore). The contents should look like this:

```properties
NEXT_PUBLIC_API_URL = http://localhost:3000
```


## Starting the application

Run the following commands in a terminal (project root folder) to get the application up and running.

Install all required node dependencies (it can take a few minutes):

```console
$ npm install
```

To start the Node.js server execute:

```console
$ npm run dev
```



## Once the application is started

Go to http://localhost:8080/login

Enter those credentials :

username : admin
password : admin

Now you are redirected to the home page.

You can go to **conversation** or **evaluate**


## Conversation

In the home page click on Conversation

Once redirected you can create a new chat. Give it a name and select a language

Once redirected to the "all chats" page click on the chat that you just created

Click on the green circle to record a message. Once your message is recorded you can click on it again.

After a few seconds you can see your message transcribed and the answer of the bot

Try a correct sentence like : "I would like to talk about computers."

Try a false sentence like : "Yesterday, I'm buying a computer."


## Evaluate

In the home page click on Evaluate

Once redirected you write or paste a text in the box (the maximum amount character is 3000)

Click on the "Verify" button

You can see the score of the text

If you want to try again click on "Verify another text"
