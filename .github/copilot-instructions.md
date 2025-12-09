# Copilot Instructions for Prototyp_Szmal

## Project Overview
This is an AI-powered video content generation system that creates surreal micro sketches for TikTok. The application orchestrates multiple AI agents to generate trending video content using OpenAI's Sora API, GPT models, and TikTok integration.

## Architecture
- **Server**: Express.js REST API (`server.js`)
- **Agent System**: Multi-agent architecture in `src/agents/`
  - `orchestrator.js`: Main workflow coordinator
  - `trend_agent.js`: Fetches trending topics
  - `story_agent.js`: Generates story outlines
  - `scene_director_agent.js`: Plans video scenes
  - `prompt_engineer_agent.js`: Creates Sora prompts
  - `script_agent.js`: Generates scripts
  - `editor_agent.js`: Polishes scripts
  - `narrator_agent.js`: Generates narration
  - `sfx_agent.js`: Adds sound effects
  - `video_edit_agent.js`: Merges video clips
  - `publish_meta_agent.js`: Creates publish metadata
  - `tiktok_agent.js`: Handles TikTok uploads
  - `openai_client.js`: OpenAI API wrapper
- **Video Generation**: `src/video/sora_client.js` for Sora API integration
- **Utilities**: `src/utils/` for helper functions
- **Frontend**: Dashboard in `dashboard/` directory

## Environment Setup

### Required Environment Variables (see `.env.example`)
- `OPENAI_API_KEY`: OpenAI API key for GPT and Sora
- `OPENAI_MODEL_GPT`: GPT model version (default: `gpt-4.1-mini`)
- `OPENAI_MODEL_SORA`: Sora model version (default: `sora-2`)
- `OPENAI_TTS_MODEL`: TTS model for narration
- `PUBLIC_URL`: Application public URL
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, etc.: TikTok API credentials
- `VIDEO_TARGET_MIN_SECONDS`, `VIDEO_TARGET_MAX_SECONDS`: Video duration settings
- `VIDEO_SIZE`: Video resolution (default: `720x1280`)

### Setup Instructions
1. Copy `.env.example` to `.env` and fill in required values
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server (listens on port 3000 by default)
4. Access dashboard at `http://localhost:3000/dashboard`

## API Endpoints
- `GET /health`: Health check endpoint
- `POST /api/trends/live`: Fetch live trends for a niche
- `POST /api/video/sora-test`: Generate a test video clip
- `POST /api/autopublish/run-once`: Run full autopublish workflow

## Code Style and Conventions
- **ES Modules**: Use `import/export` syntax (not `require`)
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Wrap API calls in try-catch blocks
- **Logging**: Use `console.log` with descriptive prefixes (e.g., `[AGENT_NAME]`)
- **Configuration**: Read all config from environment variables with defaults
- **File Paths**: Use `path` module and `fileURLToPath` for cross-platform compatibility

## Development Workflow
1. **Making Changes**: All code changes should maintain backward compatibility
2. **Testing**: Test endpoints using the dashboard or API calls
3. **Environment**: Never commit `.env` file (it's in `.gitignore`)
4. **Dependencies**: Only add dependencies if absolutely necessary

## Agent Development Guidelines
- Each agent should be a self-contained module in `src/agents/`
- Export async functions that handle a specific responsibility
- Use the `openai_client.js` wrapper for OpenAI API calls
- Return structured data that the orchestrator can process
- Include error handling and logging

## Video Processing
- Videos are stored in `videos/` directory (gitignored)
- Audio files are stored in `audio/` directory (gitignored)
- Use `ffmpeg` utilities from `src/utils/ffmpeg.js` for video manipulation
- Maintain aspect ratio and resolution as specified in env variables

## Testing
- Test individual agents by importing and calling their functions
- Use the dashboard to test the full pipeline
- Use `/api/video/sora-test` endpoint for quick Sora API verification

## Common Tasks
- **Adding a new agent**: Create a new file in `src/agents/`, export async function, integrate with orchestrator
- **Modifying video workflow**: Update `orchestrator.js` and related agents
- **Adding API endpoints**: Add routes in `server.js`, follow existing patterns
- **Updating dashboard**: Modify files in `dashboard/` directory

## Security Considerations
- API keys should only be in `.env` file (never commit)
- Validate all user inputs in API endpoints
- Use CORS middleware appropriately
- Keep dependencies updated for security patches

## Deployment
- Configured for Render.com (see `render.yaml`)
- Set environment variables in Render dashboard
- Build command: `npm install`
- Start command: `npm start`
