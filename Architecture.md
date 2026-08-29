                 ┌────────────────────┐
                 │   Next.js / React  │
                 │                    │
                 │ Patient + Doctor   │
                 └─────────┬──────────┘
                           │
                     HTTPS / WS
                           │
                           ▼
                 ┌────────────────────┐
                 │      FastAPI       │
                 │    API Gateway     │
                 └─────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Clinical Service    Document Service    ABDM Service
        │                  │                  │
        ▼                  ▼                  ▼
 Question Engine        OCR              FHIR
 Red Flags              Extraction        Consent
 Summary                Timeline           ABHA
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    AI Orchestrator
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           ASR            LLM           TTS
             │             │             │
             └─────────────┼─────────────┘
                           │
                     MongoDB Atlas
                           │
                     Redis + Queue
                           │
                     Object Storage