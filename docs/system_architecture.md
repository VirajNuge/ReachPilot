# ReachPilot System Architecture

## Figure 2: System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["🌐 Client Layer"]
        Browser["Web Browser"]
        Mobile["Mobile App (Future)"]
    end

    subgraph Dashboard["🖥️ Dashboard - Frontend (React 19 + Next.js 15)"]
        direction TB
        subgraph UI_Components["UI Components"]
            HomePage["Home Page"]
            ContentEditor["Content Editor"]
            TemplateDesigner["Template Designer (Fabric.js)"]
            AnalyticsDash["Analytics Dashboard (Recharts)"]
        end
        subgraph UI_Libraries["UI Libraries"]
            FramerMotion["Framer Motion"]
            LucideIcons["Lucide React Icons"]
            ReactIcons["React Icons"]
        end
        subgraph Styling["Styling"]
            TailwindCSS["Tailwind CSS"]
            PostCSS["PostCSS"]
            CustomCSS["Custom CSS Modules"]
        end
    end

    subgraph API["⚡ API Layer - Next.js API Routes"]
        direction TB
        subgraph Endpoints["REST Endpoints"]
            AnalyzeAPI["/api/analyze"]
            GeneratePostAPI["/api/generate-post"]
            GenerateImageAPI["/api/generate-image"]
            DebugModelsAPI["/api/debug-models"]
            UtilsAPI["/api/utils"]
        end
        subgraph Middleware["Middleware (Future)"]
            AuthMiddleware["Authentication"]
            RateLimiter["Rate Limiting"]
            Validator["Request Validation"]
            ErrorHandler["Error Handler"]
        end
    end

    subgraph AI["🤖 AI Engine"]
        direction TB
        subgraph GoogleAI["Google Generative AI"]
            GeminiAPI["@google/genai"]
            GeminiLegacy["@google/generative-ai"]
        end
        subgraph ContentGen["Content Generation"]
            SinglePostPrompt["Single Post Prompt Builder"]
            CarouselPrompt["Carousel Post Prompt Builder"]
            PromptBuilder["Dynamic Prompt Builder"]
        end
    end

    subgraph Scraping["🔍 Web Scraping Engine"]
        Puppeteer["Puppeteer (Headless Chrome)"]
        ScrapeService["Scrape Service"]
        DataExtractor["Data Extractor"]
    end

    subgraph Storage["💾 Storage Layer (Future)"]
        Database["Database (MongoDB/PostgreSQL)"]
        FileStorage["File Storage (S3/Cloudinary)"]
        Cache["Redis Cache"]
    end

    subgraph External["🔗 External Integrations (Future)"]
        Pinterest["Pinterest API"]
        Instagram["Instagram API"]
        LinkedIn["LinkedIn API"]
        Twitter["Twitter/X API"]
        Scheduler["Post Scheduler"]
    end

    %% Client to Dashboard
    Client --> Dashboard

    %% Dashboard to API
    Dashboard <-->|"HTTP Requests/Responses"| API

    %% API to AI Engine
    API <-->|"Content Generation Requests"| AI

    %% API to Scraping
    API <-->|"Web Scraping Tasks"| Scraping

    %% API to Storage (Future)
    API -.->|"Data Persistence"| Storage

    %% API to External (Future)
    API -.->|"Social Media Publishing"| External

    %% Styling
    style Client fill:#e8f5e9,stroke:#4CAF50,stroke-width:2px
    style Dashboard fill:#f3e5f5,stroke:#9C4BFF,stroke-width:2px
    style API fill:#e3f2fd,stroke:#2196F3,stroke-width:2px
    style AI fill:#fff3e0,stroke:#FF9800,stroke-width:2px
    style Scraping fill:#fce4ec,stroke:#E91E63,stroke-width:2px
    style Storage fill:#f5f5f5,stroke:#9E9E9E,stroke-width:2px,stroke-dasharray: 5 5
    style External fill:#f5f5f5,stroke:#9E9E9E,stroke-width:2px,stroke-dasharray: 5 5
```

### Legend

- **Solid lines**: Currently implemented connections
- **Dashed lines**: Future implementations
- **Dashed borders**: Planned features

---

## 6.1 System Architecture Description (100 words)

The ReachPilot system architecture follows a three-tier design pattern. The **Dashboard** serves as the user-facing frontend built with React 19 and Next.js 15, providing interfaces for content editing, analytics (Recharts), and template design (Fabric.js). The **API Layer**, built on Next.js API Routes, acts as the critical middleware bridge between the Dashboard and AI Engine. It receives user requests from the Dashboard, validates and processes them through REST endpoints, then routes appropriate requests to the AI Engine. The **AI Engine** leverages Google Gemini for intelligent content generation, Puppeteer for web scraping, and image processing capabilities. The API Layer handles response formatting and delivers processed AI-generated content back to the Dashboard seamlessly.

---

## Technology Stack Summary

| Layer               | Technologies                                                  |
| ------------------- | ------------------------------------------------------------- |
| **Frontend**        | React 19, Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| **Canvas/Graphics** | Fabric.js                                                     |
| **Charts**          | Recharts                                                      |
| **Icons**           | Lucide React, React Icons                                     |
| **API**             | Next.js API Routes                                            |
| **AI**              | Google Gemini (@google/genai, @google/generative-ai)          |
| **Scraping**        | Puppeteer                                                     |
| **Utilities**       | UUID                                                          |

## Future Implementations

| Feature            | Description                                         |
| ------------------ | --------------------------------------------------- |
| **Database**       | MongoDB/PostgreSQL for persistent storage           |
| **File Storage**   | S3/Cloudinary for images and assets                 |
| **Caching**        | Redis for performance optimization                  |
| **Social APIs**    | Pinterest, Instagram, LinkedIn, Twitter integration |
| **Scheduler**      | Automated post scheduling                           |
| **Mobile App**     | React Native mobile application                     |
| **Authentication** | User auth with JWT/OAuth                            |
