# ReachPilot Entity Relationship Diagram (ERD)

## Figure 4: Database Entity Relationship Diagram

```mermaid
erDiagram
    %% ==================== USERS & AUTH ====================
    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string avatar_url
        enum role "creator, admin"
        boolean is_active
        datetime created_at
        datetime updated_at
        datetime last_login
    }

    SESSION {
        uuid id PK
        uuid user_id FK
        string token UK
        string ip_address
        string user_agent
        datetime expires_at
        datetime created_at
    }

    %% ==================== PROJECTS & CONTENT ====================
    PROJECT {
        uuid id PK
        uuid user_id FK
        string name
        string description
        string thumbnail_url
        enum status "active, archived"
        datetime created_at
        datetime updated_at
    }

    POST {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        uuid template_id FK
        string title
        text content
        text ai_generated_content
        enum platform "pinterest, instagram, linkedin, twitter"
        enum status "draft, scheduled, published"
        json metadata
        datetime scheduled_at
        datetime published_at
        datetime created_at
        datetime updated_at
    }

    %% ==================== TEMPLATES ====================
    TEMPLATE {
        uuid id PK
        uuid user_id FK
        string name
        string description
        json canvas_data
        string thumbnail_url
        enum category "social, banner, story, carousel"
        boolean is_public
        int usage_count
        datetime created_at
        datetime updated_at
    }

    TEMPLATE_ELEMENT {
        uuid id PK
        uuid template_id FK
        enum type "text, image, shape, icon"
        json properties
        int z_index
        int position_x
        int position_y
        int width
        int height
    }

    %% ==================== AI & SCRAPING ====================
    AI_GENERATION {
        uuid id PK
        uuid user_id FK
        uuid post_id FK
        string prompt
        text response
        string model_used
        int tokens_used
        float duration_ms
        enum status "success, failed"
        datetime created_at
    }

    SCRAPE_JOB {
        uuid id PK
        uuid user_id FK
        string url
        text extracted_content
        json extracted_images
        json metadata
        enum status "pending, completed, failed"
        string error_message
        datetime created_at
        datetime completed_at
    }

    %% ==================== MEDIA ====================
    MEDIA {
        uuid id PK
        uuid user_id FK
        string filename
        string original_name
        string mime_type
        int file_size
        string storage_path
        string cdn_url
        enum type "image, video, document"
        datetime created_at
    }

    %% ==================== ANALYTICS ====================
    POST_ANALYTICS {
        uuid id PK
        uuid post_id FK
        int impressions
        int clicks
        int likes
        int shares
        int comments
        int saves
        float engagement_rate
        date analytics_date
        datetime updated_at
    }

    USER_ANALYTICS {
        uuid id PK
        uuid user_id FK
        int total_posts
        int total_ai_generations
        int total_scrapes
        int tokens_used_month
        date analytics_month
        datetime updated_at
    }

    %% ==================== SETTINGS & CONFIG ====================
    API_KEY {
        uuid id PK
        uuid user_id FK
        string service_name
        string encrypted_key
        boolean is_active
        datetime last_used
        datetime created_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        string title
        text message
        enum type "info, warning, success, error"
        boolean is_read
        datetime created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        json old_values
        json new_values
        string ip_address
        datetime created_at
    }

    %% ==================== BILLING (Future) ====================
    SUBSCRIPTION {
        uuid id PK
        uuid user_id FK
        enum plan "free, pro, enterprise"
        enum status "active, cancelled, expired"
        int token_limit
        int tokens_remaining
        datetime current_period_start
        datetime current_period_end
        datetime created_at
    }

    PAYMENT {
        uuid id PK
        uuid user_id FK
        uuid subscription_id FK
        decimal amount
        string currency
        string payment_method
        string transaction_id
        enum status "pending, completed, failed, refunded"
        datetime created_at
    }

    %% ==================== RELATIONSHIPS ====================
    USER ||--o{ SESSION : "has"
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ POST : "creates"
    USER ||--o{ TEMPLATE : "designs"
    USER ||--o{ AI_GENERATION : "requests"
    USER ||--o{ SCRAPE_JOB : "initiates"
    USER ||--o{ MEDIA : "uploads"
    USER ||--o{ API_KEY : "configures"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "generates"
    USER ||--o| SUBSCRIPTION : "subscribes"
    USER ||--o{ USER_ANALYTICS : "has"

    PROJECT ||--o{ POST : "contains"

    POST ||--o| TEMPLATE : "uses"
    POST ||--o{ AI_GENERATION : "has"
    POST ||--o{ POST_ANALYTICS : "tracks"

    TEMPLATE ||--o{ TEMPLATE_ELEMENT : "contains"

    SUBSCRIPTION ||--o{ PAYMENT : "processes"
```

---

## ERD Overview

This Entity Relationship Diagram represents the predicted database schema for ReachPilot, designed to support all current and planned features.

### Entity Groups

| Group                  | Entities                         | Purpose                                  |
| ---------------------- | -------------------------------- | ---------------------------------------- |
| **Users & Auth**       | User, Session                    | Authentication and user management       |
| **Projects & Content** | Project, Post                    | Content organization and creation        |
| **Templates**          | Template, Template_Element       | Canvas-based template design (Fabric.js) |
| **AI & Scraping**      | AI_Generation, Scrape_Job        | Track AI and scraping operations         |
| **Media**              | Media                            | File storage management                  |
| **Analytics**          | Post_Analytics, User_Analytics   | Performance tracking (Recharts)          |
| **Settings**           | API_Key, Notification, Audit_Log | Configuration and logging                |
| **Billing**            | Subscription, Payment            | Future monetization                      |

---

## Key Relationships

| Relationship         | Type        | Description                      |
| -------------------- | ----------- | -------------------------------- |
| User → Project       | One-to-Many | Users own multiple projects      |
| Project → Post       | One-to-Many | Projects contain multiple posts  |
| Post → Template      | Many-to-One | Posts can use a template         |
| Template → Element   | One-to-Many | Templates have multiple elements |
| User → AI_Generation | One-to-Many | Users request AI generations     |
| Post → Analytics     | One-to-Many | Posts track daily analytics      |

---

## Data Types Legend

| Symbol | Meaning          |
| ------ | ---------------- |
| PK     | Primary Key      |
| FK     | Foreign Key      |
| UK     | Unique Key       |
| enum   | Enumeration type |
| json   | JSON/JSONB field |
