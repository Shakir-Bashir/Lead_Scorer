# Lead Scoring Backend

A backend service to qualify leads by combining **rule-based scoring** and **AI reasoning** (OpenAI).  
It accepts **product/offer details** and **CSV leads**, then outputs intent (`High / Medium / Low`) with score and explanation.

---

## Live Preview

You can test the API at [this URL](https://lead-scorer-iatt.onrender.com)

## ⚙ Setup

```
git clone https://github.com/your-username/lead-scoring-backend.git
cd lead-scoring-backend
npm install
```

### Create `.env`

```
OPENAI_API_KEY=your_api_key_here
```

### Run Server

```
npm run start
```

## Tests

#### 01

```
curl -X POST http://localhost:3000/offer \
-H "Content-Type: application/json" \
-d '{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market"]
}'
```

#### Response

```
{
  "ok": true,
  "offer": {
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }
}
```

#### Test 02

```
curl -X POST http://localhost:3000/leads/upload -F "file=@./uploads/leads.csv"
```

#### Test 03

```
curl -X POST http://localhost:3000/score
```

#### Response

```
{
  "ok": true,
  "count": 2
}
```

#### Test 04

```
curl http://localhost:3000/score/results

#### Response

```

[
{
"name": "Ava Patel",
"role": "Head of Growth",
"company": "FlowMetrics",
"industry": "B2B SaaS mid-market",
"intent": "High",
"score": 90,
"reasoning": "Rule: 50 ({'role':20,'industry':20,'completeness':10}). AI: AI-generated explanation here."
},
{
"name": "John Smith",
"role": "Senior Marketing Manager",
"company": "Innovate Corp",
"industry": "E-commerce",
"intent": "Medium",
"score": 40,
"reasoning": "Rule: 10 ({'role':10,'industry':0,'completeness':0}). AI: AI-generated explanation here."
}
]

```

```
