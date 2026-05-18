import os

from openai import OpenAI


client = OpenAI(
    base_url="https://qianfan.baidubce.com/v2",
    api_key=os.environ["QIANFAN_API_KEY"],
)

response = client.chat.completions.create(
    model=os.environ.get("QIANFAN_MODEL", "ernie-4.5-0.3b"),
    messages=[
        {
            "role": "user",
            "content": "请用一句中文说明今天适合怎么钓黑鲈。",
        }
    ],
    temperature=0.8,
    top_p=1,
    extra_body={
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "repetition_penalty": 1,
        "stop": [],
    },
)

print(response)
