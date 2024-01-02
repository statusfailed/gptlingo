# GPTLingo

Practice speaking chinese with easy word lookup!

# Run locally

Install dependencies and run:

    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python main.py

Now edit `secret.py` and add your OpenAI API key:

    OPENAI_API_KEY = "<your key here>"

Now navigate to [localhost:8000](https://localhost:8000) to play!

You can also edit `main.py` to set your HSK level to make the conversation
easier or harder.

NOTE: I didn't implement a loading indicator; sometimes you have to wait a bit
for ChatGPT to give you a response!

# Acknowledgements

This project uses Herman Schaaf's
[chinese-ime](https://github.com/hermanschaaf/chinese-ime/) library for pinyin
input.
The following files are from that project (licensed under LGPLv3), with some
tweaks:

- [jQuery.chineseIME.js](./static/jQuery.chineseIME.js)
- [caret.js](caret.js)
- [ime.css](ime.css)

[Bulma](https://bulma.io/) is used for CSS styling.

ChatGPT wrote about 50% of the code in this project.
