#!/usr/bin/env python3

# python
from typing import List
from dataclasses import dataclass, asdict

# web
import falcon
import mimetypes
from wsgiref.simple_server import make_server

# nlp
import jieba
from openai import OpenAI
from secret import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

# mm, yummy globals
HSK_LEVEL = 3

# CHATGPT_MODEL = "gpt-3.5-turbo"
CHATGPT_MODEL = "gpt-4"

CONVERSATION_INITIAL_PROMPT = f"""\
You are a helpful Chinese language teacher, having a conversation in Chinese with a student.
Keep your responses to HSK{HSK_LEVEL} level.
If the user uses an english word, give its translation into Chinese before your response.
Your responses should be short.
Your responses must only be in Chinese.
Your first response should begin with "你好".
You start."""

CONVERSATION_INITIAL_PROMPT = """Let's have a conversation in Chinese. Keep your responses to HSK3 level. Your first response should begin with "你好". You start."""

RESOURCE_WHITELIST = {
    "bulma.css",
    "bulma.css.map",
    "index.html",
    "main.js",
    "",
    "favicon.ico",
    "main.css",
    # IME files
    "ime.css",
    "jQuery.chineseIME.js",
    "caret.js",
}
class StaticResource:
    def on_get(self, req, resp, filename):
        if filename not in RESOURCE_WHITELIST:
            raise ValueError(f"invalid file {filename}")

        if filename == "":
            filename = "index.html"

        resp.content_type = mimetypes.guess_type(filename)[0]

        try:
            resp.stream = open("static/" + filename, 'rb')
        except IOError:
            raise falcon.HTTPNotFound()

def segment(text: str):
    return list(filter(None, (w.strip() for w in jieba.cut(text))))

@dataclass
class Message:
    user: str
    words: list

    def to_openai(self):
        return {
            "role": self.user,
            "content": " ".join(self.words)
        }

    @staticmethod
    def from_content(user: str, text: str):
        return Message(user, segment(text))


def initial_message():
    return Message.from_content("system", CONVERSATION_INITIAL_PROMPT)

def get_initial_response():
    response = client.chat.completions.create(model=CHATGPT_MODEL,
    messages=[initial_message().to_openai()])

    sentence = response.choices[0].message.content
    return Message.from_content('system', sentence)

def user_message(text: str):
    return Message.from_content('user', text)

def response_message(messages: List[Message]) -> str:
    response = client.chat.completions.create(model=CHATGPT_MODEL,
    messages=[initial_message().to_openai()] + [
        m.to_openai()
        for m in messages
    ])
    sentence = response.choices[0].message.content
    words = segment(sentence)
    return Message(user="assistant", words=words)

class ConversationResource:
    def on_get(self, req, resp):
        # TODO: uncomment placeholder!
        # message = Message(user="assistant", words=["你好", "，", "你", "是", "哪", "国人", "？"])
        message = get_initial_response()
        resp.media = {
            "messages": [asdict(message)]
        }

    def on_post(self, req, resp):
        messages = [Message(**m) for m in req.media['messages']]
        new_message_text = req.media['new_message']
        new_message = user_message(new_message_text)
        messages.append(new_message)

        print('messages: ', messages)
        response = response_message(messages)
        messages.append(response)

        resp.media = {
            "messages": [asdict(m) for m in messages]
        }


################################################################################

EXPLANATION_ASSISTANT_PROMPT = """You are a helpful language teacher. Your job is to
explain the meaning of a given Chinese word in a given context."""

EXPLANATION_PROMPT = """What does the word "{word}" mean in the context of the sentence below?
In addition to your explanation, please give the pinyin for the word.

{context}
"""

def explain_word(word: str, context: str):
    response = client.chat.completions.create(
        model=CHATGPT_MODEL,
        messages=[
            {"role": "system", "content": EXPLANATION_ASSISTANT_PROMPT},
            {"role": "user", "content": EXPLANATION_PROMPT.format(word=word, context=context)},
    ])
    return response.choices[0].message.content

class ExplainResource:
    def on_post(self, req, resp):
        word, context = req.media['word'], req.media['context']
        resp.media = {
            "word": word,
            "explanation": explain_word(word, context)
        }

app = falcon.App()
app.add_route('/conversation', ConversationResource())
app.add_route('/explain', ExplainResource())
app.add_route('/{filename}', StaticResource())

if __name__ == '__main__':
    with make_server('', 8000, app) as httpd:
        print('Serving on port 8000...')

        # Serve until process is killed
        httpd.serve_forever()
