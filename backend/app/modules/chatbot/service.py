import os
import json
import time
import threading
from typing import Optional
from fastapi import HTTPException, status
from app.modules.auth.models import Employee

conversation_history: dict[str, list] = {}
model_instance = None
model_init_failed = False

ESG_SYSTEM_PROMPT = """You are EcoBot, an expert AI assistant embedded in EcoSphere — a comprehensive ESG (Environmental, Social, and Governance) management platform for organizations.

## Your Identity
- Name: EcoBot
- Platform: EcoSphere ESG Management Platform
- Personality: Professional, knowledgeable, friendly, and encouraging toward sustainability

## Your Core Expertise
1. **Environmental (E)**
   - Carbon accounting: Scope 1 (direct), Scope 2 (purchased energy), Scope 3 (value chain) emissions
   - Carbon reduction strategies and net-zero pathways
   - Environmental KPIs: CO2e, energy intensity, water usage, waste diversion
   - Science-based targets (SBTi), carbon offsets, renewable energy certificates (RECs)
   - Environmental goals tracking and progress monitoring

2. **Social (S)**
   - CSR (Corporate Social Responsibility) program design and management
   - Employee engagement and volunteering strategies
   - DEI (Diversity, Equity & Inclusion) metrics and reporting
   - Community impact measurement
   - Social KPIs: participation rates, volunteer hours, community investment
   - Health, safety, and well-being programs

3. **Governance (G)**
   - ESG policy creation and acknowledgement tracking
   - Compliance audits and issue management
   - Risk governance frameworks
   - Board-level ESG oversight structures
   - Anti-corruption, business ethics, and data privacy

4. **ESG Frameworks & Standards**
   - GRI (Global Reporting Initiative) Standards
   - SASB (Sustainability Accounting Standards Board)
   - TCFD (Task Force on Climate-related Financial Disclosures)
   - UN SDGs (17 Sustainable Development Goals)
   - CDP (Carbon Disclosure Project)
   - ISO 14001, ISO 26000
   - CSRD (Corporate Sustainability Reporting Directive)
   - BRSR (Business Responsibility and Sustainability Report) for Indian companies

5. **ESG Scoring & Reporting**
   - How ESG scores are calculated (weighted E, S, G components)
   - ESG materiality assessments
   - Stakeholder reporting best practices
   - Investor ESG disclosure requirements

6. **EcoSphere Platform Features**
   - Environmental module: Log carbon transactions, set reduction goals, track scope emissions
   - Social module: Create and join CSR activities, track participation and volunteer hours
   - Governance module: Policy management, compliance tracking, audit trails
   - Gamification module: Challenges, badges, XP points, leaderboards to drive engagement
   - Reports module: ESG score calculation, department rankings, trend analysis
   - Dashboard: Real-time KPIs, ESG score breakdown, monthly emissions chart

7. **Sustainability Strategy**
   - Corporate sustainability roadmaps
   - Stakeholder engagement strategies
   - Green procurement and supply chain sustainability
   - Circular economy principles
   - Life cycle assessment (LCA)
   - ESG integration in business strategy

## Response Guidelines
- Be concise but comprehensive — use bullet points for clarity
- Always provide actionable, practical advice
- When referencing EcoSphere features, be specific about where users can find them
- Use data and statistics when relevant
- Format responses with clear headers for longer answers
- Keep tone warm and encouraging"""

LOCAL_KNOWLEDGE = {
    'scope 1': """**Scope 1 Emissions** are direct greenhouse gas emissions from sources owned or controlled by your organization:
• Combustion in owned/controlled boilers, furnaces, vehicles
• Emissions from owned industrial processes
• Fugitive emissions (AC leaks, gas pipelines)

**To track in EcoSphere:** Go to Environmental → Log Emission → select "Scope 1" and source type (Natural Gas, Fuel, etc.)""",

    'scope 2': """**Scope 2 Emissions** are indirect emissions from purchased electricity, heat, steam, or cooling:
• Electricity consumed at your facilities
• District heating/cooling purchased
• Steam purchased from utilities

**To track in EcoSphere:** Go to Environmental → Log Emission → select "Scope 2" and "Electricity" as source type""",

    'scope 3': """**Scope 3 Emissions** are all other indirect emissions in your value chain:
• **Upstream:** Purchased goods, business travel, employee commuting, capital goods
• **Downstream:** Use of sold products, end-of-life treatment, leased assets

Scope 3 typically accounts for 70-90% of total corporate emissions. Use EcoSphere's Environmental module to log "Scope 3" transactions.""",

    'gri': """**GRI (Global Reporting Initiative)** is the world's most widely used sustainability reporting framework:
• **GRI Universal Standards:** Apply to all organizations
• **GRI Topic Standards:** Specific disclosures (GRI 305 for Emissions, GRI 401 for Employment)
• Used by 10,000+ organizations in 100+ countries

EcoSphere's Reports module generates data aligned with GRI standards for your disclosures.""",

    'esg score': """**ESG Scores** measure your organization's performance on Environmental, Social, and Governance factors:

**EcoSphere Score Calculation:**
- **Environmental (E):** Carbon reduction progress, goal completion, emission intensity
- **Social (S):** CSR participation rate, volunteer hours, employee engagement
- **Governance (G):** Policy compliance, audit completion, issue resolution rate
- Total score is weighted average (0-100 scale)

**To calculate:** Go to Reports → Calculate ESG Score → view department rankings""",

    'carbon footprint': """**Reducing Carbon Footprint — Top Strategies:**

**Energy:**
• Switch to renewable energy (solar, wind)
• Improve building energy efficiency (LED, insulation)
• Implement energy management systems

**Transportation:**
• Promote remote work and virtual meetings
• EV fleet transition
• Incentivize public transport/cycling

**Operations:**
• Optimize supply chain logistics
• Reduce waste and increase recycling
• Implement circular economy practices

**Track your progress** in EcoSphere's Environmental module with monthly emission goals!""",

    'csr': """**CSR (Corporate Social Responsibility) Best Practices:**

**High-Impact Activities:**
• Community volunteering programs
• Educational partnerships and scholarships
• Environmental cleanup drives
• Healthcare camps and wellness programs
• Local supplier development

**Employee Engagement Tips:**
• Let employees choose causes they care about
• Create team CSR challenges (great for Gamification!)
• Recognize and reward participation with badges and XP
• Share impact stories internally

**Track in EcoSphere:** Social module → Create CSR Activity → employees join and log participation""",

    'sdg': """**UN Sustainable Development Goals (SDGs) most relevant to corporate ESG:**

• **SDG 7:** Affordable and Clean Energy
• **SDG 8:** Decent Work and Economic Growth
• **SDG 12:** Responsible Consumption and Production
• **SDG 13:** Climate Action
• **SDG 15:** Life on Land
• **SDG 16:** Peace, Justice and Strong Institutions
• **SDG 17:** Partnerships for the Goals

Map your EcoSphere activities to specific SDGs for your sustainability report!""",

    'tcfd': """**TCFD (Task Force on Climate-related Financial Disclosures)** framework covers:

• **Governance:** Board oversight of climate risks
• **Strategy:** Climate risks/opportunities impact on business
• **Risk Management:** Identifying and managing climate risks
• **Metrics & Targets:** Carbon emissions, climate KPIs, reduction targets

EcoSphere's Reports module provides the emissions data you need for TCFD disclosures.""",

    'gamification': """**Gamification for Sustainability Engagement:**

**EcoSphere Gamification Features:**
• **Challenges:** Time-bound sustainability tasks
• **Badges:** Awards for achievements (Carbon Champion, CSR Hero)
• **XP Points:** Earned for every eco-friendly action logged
• **Leaderboards:** Department and individual rankings

**Best Practices:**
• Set clear, achievable challenge targets
• Make leaderboards visible to all employees
• Celebrate badge earners in team meetings
• Align challenges with your ESG goals""",
}

DEFAULT_RESPONSE = """I'm **EcoBot**, your EcoSphere ESG assistant! 

I can help you with:
• **Carbon & Emissions** — Scope 1, 2, 3 tracking, carbon reduction strategies
• **ESG Frameworks** — GRI, SASB, TCFD, UN SDGs, CDP
• **CSR & Social** — Activity ideas, employee engagement, DEI metrics
• **Governance** — Compliance, policies, audit management
• **ESG Scoring** — How scores work, improvement strategies
• **Gamification** — Challenges, badges, leaderboards

What would you like to explore?"""


def _get_local_response(message: str) -> str | None:
    msg = message.lower()
    keywords = {
        'scope 1': 'scope 1', 'scope1': 'scope 1',
        'scope 2': 'scope 2', 'scope2': 'scope 2',
        'scope 3': 'scope 3', 'scope3': 'scope 3',
        'gri': 'gri', 'global reporting': 'gri',
        'esg score': 'esg score', 'calculate score': 'esg score', 'scoring': 'esg score',
        'carbon footprint': 'carbon footprint', 'reduce carbon': 'carbon footprint', 'carbon reduction': 'carbon footprint',
        'csr': 'csr', 'corporate social': 'csr', 'volunteer': 'csr',
        'sdg': 'sdg', 'sustainable development goal': 'sdg',
        'tcfd': 'tcfd', 'climate disclosure': 'tcfd', 'climate risk': 'tcfd',
        'gamif': 'gamification', 'badge': 'gamification', 'challenge': 'gamification', 'leaderboard': 'gamification',
    }
    for key, value in keywords.items():
        if key in msg:
            return LOCAL_KNOWLEDGE.get(value)
    return None


def _get_gemini_model():
    global model_instance, model_init_failed
    if model_instance:
        return model_instance
    if model_init_failed:
        return None
    try:
        import google.generativeai as genai
        api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model_instance = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                }
            )
            return model_instance
        else:
            model_init_failed = True
            return None
    except Exception:
        model_init_failed = True
        return None


def chat_with_ecobot(message: str, session_id: str | None, user: Employee):
    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    sid = session_id or str(user.id)
    user_name = user.name.split()[0] if user.name else "there"

    local_answer = _get_local_response(message)
    model = _get_gemini_model()

    if model:
        if sid not in conversation_history:
            conversation_history[sid] = []
        history = conversation_history[sid]

        try:
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(
                f"{ESG_SYSTEM_PROMPT}\n\nUser ({user_name}): {message}\n\nRespond as EcoBot:"
            )
            ai_response = response.text if response.text else "I could not generate a response."

            history.append({"role": "user", "parts": [message]})
            history.append({"role": "model", "parts": [ai_response]})
            if len(history) > 20:
                history[:2] = []
            conversation_history[sid] = history

            threading.Timer(1800.0, lambda: conversation_history.pop(sid, None)).start()

            return {
                "success": True,
                "data": {
                    "response": ai_response,
                    "session_id": sid,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "source": "gemini",
                }
            }
        except Exception:
            pass

    fallback = local_answer or DEFAULT_RESPONSE
    return {
        "success": True,
        "data": {
            "response": fallback,
            "session_id": sid,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "source": "local",
        }
    }


def clear_session(session_id: str):
    conversation_history.pop(session_id, None)


def get_esg_tips():
    return [
        {"category": "Environmental", "tip": "Track Scope 1, 2, and 3 emissions separately for accurate carbon accounting. Scope 3 often represents 70-90% of total emissions."},
        {"category": "Social", "tip": "Employee participation in CSR activities increases by 3x when activities align with personal values."},
        {"category": "Governance", "tip": "Regular policy acknowledgements ensure all employees are aware of compliance requirements."},
        {"category": "Gamification", "tip": "Challenges with clear deadlines and visible leaderboards drive 40% higher participation rates."},
        {"category": "Environmental", "tip": "Science-based targets (SBTi) aligned with the Paris Agreement (1.5°C pathway) are the gold standard."},
        {"category": "Social", "tip": "Diversity metrics should be tracked across gender, ethnicity, age, and disability status for comprehensive GRI reporting."},
        {"category": "Governance", "tip": "Companies with strong ESG governance have 25% lower cost of capital."},
        {"category": "Environmental", "tip": "Setting a monthly carbon budget per department creates healthy competition and measurable reduction."},
        {"category": "Social", "tip": "Volunteer time off (VTO) programs offering 1-3 paid days per year increase employee retention by up to 15%."},
        {"category": "Governance", "tip": "Use EcoSphere's audit trail features to document all ESG decisions for TCFD and GRI disclosures."},
    ]


def get_esg_reference():
    return {
        "frameworks": ["GRI Standards", "SASB", "TCFD", "UN SDGs", "CDP", "ISO 14001", "CSRD", "BRSR"],
        "emissionScopes": {
            "scope1": "Direct emissions from owned/controlled sources",
            "scope2": "Indirect from purchased electricity/heat/steam",
            "scope3": "All other indirect emissions in value chain",
        },
        "esgComponents": {
            "environmental": ["Carbon emissions", "Energy consumption", "Water usage", "Waste management", "Biodiversity"],
            "social": ["Employee engagement", "DEI metrics", "Community investment", "Health & safety", "Supply chain labor"],
            "governance": ["Board composition", "Anti-corruption", "Data privacy", "Policy compliance", "Risk management"],
        },
        "keyMetrics": {
            "carbon": "CO2 equivalent (CO2e) in tonnes",
            "energy": "kWh or GJ per revenue or employee",
            "water": "cubic meters or liters",
            "waste": "tonnes diverted from landfill (%)",
            "social": "volunteer hours, participation rate (%)",
        },
    }
