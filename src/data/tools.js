// Aoogle's tool index — a curated MVP dataset.
// Pricing tiers and feature sets change fast in this space; treat this as a
// starting point to keep fresh, not a permanent source of truth.

export const CATEGORIES = [
  'Image',
  'Video',
  'Audio & Voice',
  'Writing',
  'Code',
  'Chat & Assistants',
  'Productivity',
  'Research',
  'Design',
  'Marketing',
  'Meetings',
  'Presentations',
  'Translation',
]

export const PRICING_TIERS = ['Free', 'Freemium', 'Paid']

export const TOOLS = [
  // ---------- Image ----------
  { id: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', category: 'Image', pricing: 'Paid', description: 'Turns text prompts into highly stylised, painterly images.', tags: ['text to image', 'ai art', 'illustration', 'concept art'] },
  { id: 'dalle3', name: 'DALL·E 3', url: 'https://openai.com/dall-e-3', category: 'Image', pricing: 'Paid', description: "OpenAI's image generator, built into ChatGPT for quick visuals.", tags: ['text to image', 'ai art', 'illustration'] },
  { id: 'stable-diffusion', name: 'Stable Diffusion (DreamStudio)', url: 'https://stability.ai', category: 'Image', pricing: 'Freemium', description: 'Open-weight image model you can run yourself or host in the browser.', tags: ['text to image', 'open source', 'ai art'] },
  { id: 'leonardo-ai', name: 'Leonardo AI', url: 'https://leonardo.ai', category: 'Image', pricing: 'Freemium', description: 'Image generator built for game art, concept art and product shots.', tags: ['text to image', 'game art', 'concept art'] },
  { id: 'ideogram', name: 'Ideogram', url: 'https://ideogram.ai', category: 'Image', pricing: 'Freemium', description: "Image generator that's unusually good at rendering readable text.", tags: ['text to image', 'logo text', 'poster'] },
  { id: 'adobe-firefly', name: 'Adobe Firefly', url: 'https://firefly.adobe.com', category: 'Image', pricing: 'Freemium', description: "Adobe's image model, wired straight into Photoshop's generative fill.", tags: ['generative fill', 'photo edit', 'text to image'] },
  { id: 'canva-ai', name: 'Canva (Magic Studio)', url: 'https://canva.com', category: 'Image', pricing: 'Freemium', description: 'Design tool with built-in ai for backgrounds, resizing and generation.', tags: ['design', 'poster', 'social graphic', 'remove background'] },
  { id: 'remove-bg', name: 'Remove.bg', url: 'https://remove.bg', category: 'Image', pricing: 'Freemium', description: 'Strips the background out of a photo in one click, no signup.', tags: ['remove background', 'transparent png', 'product photo', 'cut out'] },
  { id: 'photoroom', name: 'Photoroom', url: 'https://photoroom.com', category: 'Image', pricing: 'Freemium', description: 'Background removal plus clean product-photo templates for listings.', tags: ['remove background', 'product photo', 'ecommerce', 'batch edit'] },
  { id: 'clipdrop', name: 'Clipdrop', url: 'https://clipdrop.co', category: 'Image', pricing: 'Freemium', description: 'Toolkit of quick image fixes — cleanup, upscale, relight, swap.', tags: ['remove background', 'upscale image', 'cleanup', 'relight'] },
  { id: 'krea', name: 'Krea AI', url: 'https://krea.ai', category: 'Image', pricing: 'Freemium', description: 'Real-time image generation you can sketch and steer as it renders.', tags: ['text to image', 'real time', 'sketch to image'] },
  { id: 'recraft', name: 'Recraft', url: 'https://recraft.ai', category: 'Image', pricing: 'Freemium', description: 'Generates vector graphics and icon sets, not just raster images.', tags: ['vector art', 'icon design', 'logo', 'illustration'] },
  { id: 'topaz-photo-ai', name: 'Topaz Photo AI', url: 'https://topazlabs.com', category: 'Image', pricing: 'Paid', description: 'Upscales, denoises and sharpens photos with dedicated models.', tags: ['upscale image', 'denoise', 'sharpen', 'photo restoration'] },
  { id: 'remini', name: 'Remini', url: 'https://remini.ai', category: 'Image', pricing: 'Freemium', description: 'Restores and sharpens old or low-resolution photos, popular on mobile.', tags: ['photo restoration', 'upscale image', 'old photo fix'] },
  { id: 'pixlr', name: 'Pixlr', url: 'https://pixlr.com', category: 'Image', pricing: 'Freemium', description: 'Browser photo editor with one-click ai background and object removal.', tags: ['photo editing', 'remove background', 'object removal'] },
  { id: 'vance-ai', name: 'VanceAI', url: 'https://vanceai.com', category: 'Image', pricing: 'Freemium', description: 'Bundle of one-click photo fixes — upscale, denoise, colorize, cut out.', tags: ['upscale image', 'remove background', 'photo restoration'] },
  { id: 'nightcafe', name: 'NightCafe', url: 'https://nightcafe.studio', category: 'Image', pricing: 'Freemium', description: 'Community-driven ai art generator with several models to pick from.', tags: ['text to image', 'ai art', 'community'] },

  // ---------- Video ----------
  { id: 'runway', name: 'Runway', url: 'https://runwayml.com', category: 'Video', pricing: 'Freemium', description: 'Text-to-video and video-editing model, widely used for short ai clips.', tags: ['text to video', 'video editing', 'ai film'] },
  { id: 'pika', name: 'Pika', url: 'https://pika.art', category: 'Video', pricing: 'Freemium', description: 'Turns a text prompt or still image into a short animated clip.', tags: ['text to video', 'image to video', 'animation'] },
  { id: 'luma-dream-machine', name: 'Luma Dream Machine', url: 'https://lumalabs.ai', category: 'Video', pricing: 'Freemium', description: 'Generates realistic short video clips from a text description.', tags: ['text to video', 'realistic video'] },
  { id: 'kling', name: 'Kling AI', url: 'https://klingai.com', category: 'Video', pricing: 'Freemium', description: 'Video generation model known for longer, more coherent clips.', tags: ['text to video', 'long video', 'cinematic'] },
  { id: 'sora', name: 'Sora', url: 'https://openai.com/sora', category: 'Video', pricing: 'Paid', description: "OpenAI's text-to-video model for short, high-fidelity generated clips.", tags: ['text to video', 'cinematic'] },
  { id: 'synthesia', name: 'Synthesia', url: 'https://synthesia.io', category: 'Video', pricing: 'Paid', description: 'Turns a script into a video with an ai presenter, no camera needed.', tags: ['ai avatar', 'explainer video', 'training video'] },
  { id: 'heygen', name: 'HeyGen', url: 'https://heygen.com', category: 'Video', pricing: 'Freemium', description: 'Ai avatar videos with lip-synced translation into other languages.', tags: ['ai avatar', 'video translation', 'talking head'] },
  { id: 'descript', name: 'Descript', url: 'https://descript.com', category: 'Video', pricing: 'Freemium', description: 'Edits video and podcasts by editing the transcript, like a text doc.', tags: ['video editing', 'podcast editing', 'transcript edit', 'remove filler words'] },
  { id: 'capcut', name: 'CapCut', url: 'https://capcut.com', category: 'Video', pricing: 'Free', description: 'Free video editor with ai captions, background removal and templates.', tags: ['video editing', 'captions', 'short form video', 'mobile edit'] },
  { id: 'opus-clip', name: 'Opus Clip', url: 'https://opus.pro', category: 'Video', pricing: 'Freemium', description: 'Finds the best moments in a long video and cuts short clips.', tags: ['repurpose video', 'short clips', 'clip long video'] },
  { id: 'vidnoz', name: 'Vidnoz', url: 'https://vidnoz.com', category: 'Video', pricing: 'Freemium', description: 'Free ai avatar video generator with a large template library.', tags: ['ai avatar', 'explainer video', 'talking head'] },
  { id: 'colossyan', name: 'Colossyan', url: 'https://colossyan.com', category: 'Video', pricing: 'Freemium', description: 'Ai avatar videos aimed at corporate training content.', tags: ['ai avatar', 'training video', 'explainer video'] },

  // ---------- Audio & Voice ----------
  { id: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io', category: 'Audio & Voice', pricing: 'Freemium', description: 'Realistic text-to-speech and voice cloning, widely used for narration.', tags: ['text to speech', 'voice clone', 'narration', 'dubbing'] },
  { id: 'murf', name: 'Murf AI', url: 'https://murf.ai', category: 'Audio & Voice', pricing: 'Freemium', description: 'Studio-style text-to-speech voiceovers for videos and presentations.', tags: ['text to speech', 'voiceover', 'narration'] },
  { id: 'playht', name: 'Play.ht', url: 'https://play.ht', category: 'Audio & Voice', pricing: 'Freemium', description: 'Text-to-speech api and app with a large voice library.', tags: ['text to speech', 'voice api', 'audiobook'] },
  { id: 'suno', name: 'Suno', url: 'https://suno.com', category: 'Audio & Voice', pricing: 'Freemium', description: 'Generates full songs, vocals and instrumentation from a text prompt.', tags: ['text to music', 'song generator', 'ai music'] },
  { id: 'udio', name: 'Udio', url: 'https://udio.com', category: 'Audio & Voice', pricing: 'Freemium', description: 'Generates original songs from a text prompt.', tags: ['text to music', 'song generator', 'ai music'] },
  { id: 'adobe-podcast', name: 'Adobe Podcast Enhance', url: 'https://podcast.adobe.com', category: 'Audio & Voice', pricing: 'Free', description: 'Cleans up noisy voice recordings into studio-quality audio.', tags: ['audio cleanup', 'noise removal', 'podcast audio'] },
  { id: 'speechify', name: 'Speechify', url: 'https://speechify.com', category: 'Audio & Voice', pricing: 'Freemium', description: 'Reads any text, pdf or article aloud in a natural voice.', tags: ['text to speech', 'read aloud', 'listen to articles'] },
  { id: 'wellsaid-labs', name: 'WellSaid Labs', url: 'https://wellsaidlabs.com', category: 'Audio & Voice', pricing: 'Paid', description: 'Enterprise-grade voiceover platform with licensed, studio-trained voices.', tags: ['text to speech', 'voiceover', 'brand voice'] },

  // ---------- Writing ----------
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', category: 'Writing', pricing: 'Freemium', description: 'General-purpose chat assistant for drafting, brainstorming and editing.', tags: ['writing assistant', 'chatbot', 'brainstorm', 'editing', 'resume writing', 'cover letter'] },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', category: 'Writing', pricing: 'Freemium', description: "Anthropic's assistant, strong at long documents and careful writing.", tags: ['writing assistant', 'chatbot', 'long document', 'editing', 'resume writing', 'cover letter'] },
  { id: 'jasper', name: 'Jasper', url: 'https://jasper.ai', category: 'Writing', pricing: 'Paid', description: 'Marketing-focused writing assistant with brand voice and templates.', tags: ['marketing copy', 'blog writing', 'brand voice'] },
  { id: 'copy-ai', name: 'Copy.ai', url: 'https://copy.ai', category: 'Writing', pricing: 'Freemium', description: 'Templates for ad copy, product descriptions and email drafts.', tags: ['marketing copy', 'ad copy', 'email writing'] },
  { id: 'grammarly', name: 'Grammarly', url: 'https://grammarly.com', category: 'Writing', pricing: 'Freemium', description: 'Grammar, tone and clarity checker that works inside any app you type in.', tags: ['grammar check', 'proofreading', 'tone check'] },
  { id: 'quillbot', name: 'QuillBot', url: 'https://quillbot.com', category: 'Writing', pricing: 'Freemium', description: 'Paraphrasing and summarising tool for rewriting existing text.', tags: ['paraphrase', 'rewrite text', 'summarize'] },
  { id: 'sudowrite', name: 'Sudowrite', url: 'https://sudowrite.com', category: 'Writing', pricing: 'Paid', description: 'Writing assistant built specifically for fiction and long-form stories.', tags: ['fiction writing', 'story writing', 'novel'] },
  { id: 'rytr', name: 'Rytr', url: 'https://rytr.me', category: 'Writing', pricing: 'Freemium', description: 'Lightweight ai writer for short copy — bios, captions, emails.', tags: ['short copy', 'social captions', 'bio writing', 'resume writing'] },
  { id: 'writesonic', name: 'Writesonic', url: 'https://writesonic.com', category: 'Writing', pricing: 'Freemium', description: 'Ai writer aimed at blog posts and seo-friendly articles.', tags: ['blog writing', 'seo content', 'article writing'] },
  { id: 'wordtune', name: 'Wordtune', url: 'https://wordtune.com', category: 'Writing', pricing: 'Freemium', description: 'Rewrites sentences to sound clearer or match a chosen tone.', tags: ['rewrite sentence', 'tone rewrite', 'clarity'] },

  // ---------- Code ----------
  { id: 'github-copilot', name: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'Code', pricing: 'Paid', description: 'Autocompletes code and chats about your codebase inside the editor.', tags: ['code completion', 'pair programmer', 'ide plugin', 'code review'] },
  { id: 'coderabbit', name: 'CodeRabbit', url: 'https://coderabbit.ai', category: 'Code', pricing: 'Freemium', description: 'Leaves line-by-line review comments on your pull requests automatically.', tags: ['code review', 'pull request review', 'pr review'] },
  { id: 'qodo', name: 'Qodo', url: 'https://qodo.ai', category: 'Code', pricing: 'Freemium', description: 'Reviews pull requests and generates tests to cover the changed code.', tags: ['code review', 'pr review', 'test generation'] },
  { id: 'cursor', name: 'Cursor', url: 'https://cursor.com', category: 'Code', pricing: 'Freemium', description: 'Code editor built around an ai pair-programmer, forked from VS Code.', tags: ['ai code editor', 'pair programmer', 'refactor code'] },
  { id: 'windsurf', name: 'Windsurf', url: 'https://windsurf.com', category: 'Code', pricing: 'Freemium', description: 'Ai-native code editor with an agent that edits across files.', tags: ['ai code editor', 'agent coding', 'refactor code'] },
  { id: 'codeium', name: 'Codeium', url: 'https://codeium.com', category: 'Code', pricing: 'Freemium', description: 'Free code-completion plugin that works across most popular editors.', tags: ['code completion', 'ide plugin', 'free'] },
  { id: 'tabnine', name: 'Tabnine', url: 'https://tabnine.com', category: 'Code', pricing: 'Freemium', description: 'Code-completion tool with an option to run fully on your own machine.', tags: ['code completion', 'private model', 'ide plugin'] },
  { id: 'replit-ai', name: 'Replit AI', url: 'https://replit.com', category: 'Code', pricing: 'Freemium', description: 'Browser coding environment with an agent that can build and deploy apps.', tags: ['build app', 'deploy app', 'agent coding', 'browser ide'] },
  { id: 'v0', name: 'v0', url: 'https://v0.dev', category: 'Code', pricing: 'Freemium', description: 'Generates a working react ui from a text description or screenshot.', tags: ['generate ui', 'react components', 'frontend from prompt'] },
  { id: 'bolt-new', name: 'Bolt.new', url: 'https://bolt.new', category: 'Code', pricing: 'Freemium', description: 'Builds and runs a full web app in the browser from a prompt.', tags: ['build app', 'full stack from prompt', 'browser ide'] },
  { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev', category: 'Code', pricing: 'Freemium', description: 'Turns a product description into a working web app you can keep editing.', tags: ['build app', 'no code app', 'frontend from prompt'] },
  { id: 'sourcegraph-cody', name: 'Sourcegraph Cody', url: 'https://sourcegraph.com/cody', category: 'Code', pricing: 'Freemium', description: 'Code assistant that understands and searches across a large codebase.', tags: ['code search', 'large codebase', 'code completion'] },
  { id: 'amazon-q-developer', name: 'Amazon Q Developer', url: 'https://aws.amazon.com/q/developer', category: 'Code', pricing: 'Freemium', description: "Aws's coding assistant, tuned for cloud and infrastructure code.", tags: ['code completion', 'aws', 'cloud code'] },
  { id: 'warp', name: 'Warp', url: 'https://warp.dev', category: 'Code', pricing: 'Freemium', description: 'Terminal with an ai assistant that explains and writes shell commands.', tags: ['terminal', 'command line', 'shell commands'] },

  // ---------- Chat & Assistants ----------
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', category: 'Chat & Assistants', pricing: 'Freemium', description: 'Answers questions directly with cited sources, instead of a list of links.', tags: ['research assistant', 'cited answers', 'search alternative'] },
  { id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com', category: 'Chat & Assistants', pricing: 'Freemium', description: "Google's assistant, tied into search, docs and gmail.", tags: ['chatbot', 'google integration', 'writing assistant'] },
  { id: 'meta-ai', name: 'Meta AI', url: 'https://meta.ai', category: 'Chat & Assistants', pricing: 'Free', description: 'Free assistant built into Instagram, WhatsApp and Facebook.', tags: ['chatbot', 'free assistant', 'social media integration'] },
  { id: 'character-ai', name: 'Character.AI', url: 'https://character.ai', category: 'Chat & Assistants', pricing: 'Freemium', description: 'Chat with custom ai personas built by the community.', tags: ['character chat', 'roleplay', 'custom persona'] },
  { id: 'poe', name: 'Poe', url: 'https://poe.com', category: 'Chat & Assistants', pricing: 'Freemium', description: 'One app that gives you access to many different chat models.', tags: ['chatbot', 'multiple models', 'model comparison'] },
  { id: 'you-com', name: 'You.com', url: 'https://you.com', category: 'Chat & Assistants', pricing: 'Freemium', description: 'Search engine with an ai assistant and app shortcuts built in.', tags: ['search alternative', 'chatbot', 'ai search'] },

  // ---------- Productivity ----------
  { id: 'notion-ai', name: 'Notion AI', url: 'https://notion.so', category: 'Productivity', pricing: 'Freemium', description: 'Writes, summarises and answers questions right inside your Notion docs.', tags: ['notes', 'doc summarize', 'writing in notes'] },
  { id: 'mem', name: 'Mem', url: 'https://mem.ai', category: 'Productivity', pricing: 'Freemium', description: 'Note app that auto-organises and surfaces old notes for you.', tags: ['notes', 'auto organize', 'second brain'] },
  { id: 'coda', name: 'Coda', url: 'https://coda.io', category: 'Productivity', pricing: 'Freemium', description: 'Docs that behave like apps, with ai to fill in and summarise tables.', tags: ['docs', 'tables', 'workflow app'] },
  { id: 'clickup', name: 'ClickUp', url: 'https://clickup.com', category: 'Productivity', pricing: 'Freemium', description: 'Project management tool with ai for summaries and standup updates.', tags: ['project management', 'task tracking', 'ai summary'] },
  { id: 'zapier', name: 'Zapier', url: 'https://zapier.com', category: 'Productivity', pricing: 'Freemium', description: 'Connects your apps and can now build automations from a plain-english prompt.', tags: ['automation', 'connect apps', 'workflow'] },
  { id: 'make', name: 'Make', url: 'https://make.com', category: 'Productivity', pricing: 'Freemium', description: 'Visual automation builder for connecting apps into multi-step workflows.', tags: ['automation', 'visual workflow', 'connect apps'] },
  { id: 'n8n', name: 'n8n', url: 'https://n8n.io', category: 'Productivity', pricing: 'Freemium', description: 'Open-source automation tool you can self-host for full control.', tags: ['automation', 'self hosted', 'workflow'] },
  { id: 'bardeen', name: 'Bardeen', url: 'https://bardeen.ai', category: 'Productivity', pricing: 'Freemium', description: 'Browser automation that scrapes and moves data between web apps.', tags: ['automation', 'browser scraping', 'connect apps'] },
  { id: 'numerous-ai', name: 'Numerous', url: 'https://numerous.ai', category: 'Productivity', pricing: 'Freemium', description: 'Adds ai formulas directly into spreadsheet cells, like a smart function.', tags: ['spreadsheet', 'google sheets', 'excel formula'] },
  { id: 'julius-ai', name: 'Julius AI', url: 'https://julius.ai', category: 'Productivity', pricing: 'Freemium', description: 'Analyses a spreadsheet or csv and answers questions in plain english.', tags: ['data analysis', 'spreadsheet', 'chart from data'] },
  { id: 'shortwave', name: 'Shortwave', url: 'https://shortwave.com', category: 'Productivity', pricing: 'Freemium', description: 'Email client with ai for triage, summaries and drafting replies.', tags: ['email assistant', 'inbox triage', 'draft email'] },
  { id: 'superhuman', name: 'Superhuman', url: 'https://superhuman.com', category: 'Productivity', pricing: 'Paid', description: 'Fast email client with ai-drafted replies and inbox triage.', tags: ['email assistant', 'inbox triage', 'draft email'] },

  // ---------- Research ----------
  { id: 'elicit', name: 'Elicit', url: 'https://elicit.org', category: 'Research', pricing: 'Freemium', description: 'Searches academic papers and pulls out findings into a table.', tags: ['research papers', 'literature review', 'academic search'] },
  { id: 'consensus', name: 'Consensus', url: 'https://consensus.app', category: 'Research', pricing: 'Freemium', description: 'Search engine that answers questions using only peer-reviewed papers.', tags: ['research papers', 'academic search', 'cited answers'] },
  { id: 'scispace', name: 'SciSpace', url: 'https://typeset.io', category: 'Research', pricing: 'Freemium', description: 'Explains dense academic papers in plain language, section by section.', tags: ['research papers', 'explain paper', 'academic reading'] },
  { id: 'chatpdf', name: 'ChatPDF', url: 'https://chatpdf.com', category: 'Research', pricing: 'Freemium', description: 'Upload a pdf and ask it questions instead of reading the whole thing.', tags: ['pdf chat', 'document q&a', 'summarize pdf'] },
  { id: 'humata', name: 'Humata', url: 'https://humata.ai', category: 'Research', pricing: 'Freemium', description: 'Ask questions across many uploaded documents at once.', tags: ['pdf chat', 'document q&a', 'multiple documents'] },
  { id: 'pdf-ai', name: 'PDF.ai', url: 'https://pdf.ai', category: 'Research', pricing: 'Freemium', description: 'Chat with a pdf to pull out answers, clauses or summaries.', tags: ['pdf chat', 'document q&a', 'contract review'] },
  { id: 'explainpaper', name: 'Explainpaper', url: 'https://explainpaper.com', category: 'Research', pricing: 'Freemium', description: 'Highlight a confusing part of a paper and get a plain explanation.', tags: ['explain paper', 'academic reading', 'research papers'] },

  // ---------- Design ----------
  { id: 'figma-ai', name: 'Figma AI', url: 'https://figma.com', category: 'Design', pricing: 'Freemium', description: 'Design tool with ai for generating layouts and renaming layers.', tags: ['ui design', 'prototype', 'generate layout'] },
  { id: 'framer', name: 'Framer', url: 'https://framer.com', category: 'Design', pricing: 'Freemium', description: 'Builds a real, publishable website from a text prompt or design.', tags: ['website builder', 'landing page', 'no code site'] },
  { id: 'webflow', name: 'Webflow', url: 'https://webflow.com', category: 'Design', pricing: 'Freemium', description: 'Visual website builder with ai for first-draft copy and layout.', tags: ['website builder', 'no code site', 'landing page'] },
  { id: 'uizard', name: 'Uizard', url: 'https://uizard.io', category: 'Design', pricing: 'Freemium', description: 'Turns a sketch or screenshot into an editable app design.', tags: ['ui design', 'sketch to design', 'app mockup'] },
  { id: 'looka', name: 'Looka', url: 'https://looka.com', category: 'Design', pricing: 'Paid', description: 'Generates a logo and basic brand kit from a few style questions.', tags: ['logo design', 'brand kit', 'logo maker'] },
  { id: 'designs-ai', name: 'Designs.ai', url: 'https://designs.ai', category: 'Design', pricing: 'Freemium', description: 'Bundle of design tools — logo, video and voiceover generators in one.', tags: ['logo design', 'design bundle', 'video maker'] },

  // ---------- Marketing ----------
  { id: 'surfer-seo', name: 'Surfer SEO', url: 'https://surferseo.com', category: 'Marketing', pricing: 'Paid', description: "Scores a draft article against what's already ranking for that keyword.", tags: ['seo content', 'keyword optimization', 'content score'] },
  { id: 'frase', name: 'Frase', url: 'https://frase.io', category: 'Marketing', pricing: 'Freemium', description: 'Researches a topic and drafts an seo outline before you write.', tags: ['seo content', 'content outline', 'keyword research'] },
  { id: 'anyword', name: 'Anyword', url: 'https://anyword.com', category: 'Marketing', pricing: 'Freemium', description: "Predicts how well ad copy will perform before you spend on it.", tags: ['ad copy', 'marketing copy', 'performance prediction'] },
  { id: 'adcreative-ai', name: 'AdCreative.ai', url: 'https://adcreative.ai', category: 'Marketing', pricing: 'Paid', description: 'Generates ad creative and banner variations for paid campaigns.', tags: ['ad creative', 'banner design', 'ad copy'] },
  { id: 'ocoya', name: 'Ocoya', url: 'https://ocoya.com', category: 'Marketing', pricing: 'Freemium', description: 'Drafts and schedules social posts across platforms from one place.', tags: ['social media', 'content calendar', 'post scheduling'] },
  { id: 'hootsuite', name: 'Hootsuite (OwlyWriter AI)', url: 'https://hootsuite.com', category: 'Marketing', pricing: 'Paid', description: 'Social media scheduler with an ai assistant for caption ideas.', tags: ['social media', 'content calendar', 'caption writing'] },

  // ---------- Meetings ----------
  { id: 'otter-ai', name: 'Otter.ai', url: 'https://otter.ai', category: 'Meetings', pricing: 'Freemium', description: 'Transcribes meetings live and summarises the action items after.', tags: ['meeting notes', 'transcription', 'action items', 'summarize meeting'] },
  { id: 'fireflies', name: 'Fireflies.ai', url: 'https://fireflies.ai', category: 'Meetings', pricing: 'Freemium', description: 'Joins your calls to record, transcribe and index meetings for search.', tags: ['meeting notes', 'transcription', 'call recording', 'summarize meeting'] },
  { id: 'fathom', name: 'Fathom', url: 'https://fathom.video', category: 'Meetings', pricing: 'Free', description: 'Free meeting recorder that clips highlights and writes a summary.', tags: ['meeting notes', 'call recording', 'highlights', 'summarize meeting'] },
  { id: 'tldv', name: 'tl;dv', url: 'https://tldv.io', category: 'Meetings', pricing: 'Freemium', description: 'Records and timestamps meetings, with clips you can share.', tags: ['meeting notes', 'call recording', 'video clips', 'summarize meeting'] },
  { id: 'read-ai', name: 'Read AI', url: 'https://read.ai', category: 'Meetings', pricing: 'Freemium', description: 'Scores meeting engagement and writes a summary with next steps.', tags: ['meeting notes', 'meeting summary', 'engagement score'] },
  { id: 'krisp', name: 'Krisp', url: 'https://krisp.ai', category: 'Meetings', pricing: 'Freemium', description: 'Removes background noise and echo from your mic on any call.', tags: ['noise cancellation', 'call quality', 'background noise removal'] },
  { id: 'grain', name: 'Grain', url: 'https://grain.com', category: 'Meetings', pricing: 'Freemium', description: 'Clips and shares key moments from recorded calls.', tags: ['meeting notes', 'call recording', 'highlights'] },

  // ---------- Presentations ----------
  { id: 'gamma', name: 'Gamma', url: 'https://gamma.app', category: 'Presentations', pricing: 'Freemium', description: 'Turns an outline or prompt into a full slide deck in minutes.', tags: ['slide deck', 'presentation', 'pitch deck'] },
  { id: 'tome', name: 'Tome', url: 'https://tome.app', category: 'Presentations', pricing: 'Freemium', description: 'Generates a narrative slide deck or one-pager from a prompt.', tags: ['slide deck', 'presentation', 'narrative deck'] },
  { id: 'beautiful-ai', name: 'Beautiful.ai', url: 'https://beautiful.ai', category: 'Presentations', pricing: 'Freemium', description: 'Slide deck tool that auto-adjusts layout so slides stay tidy.', tags: ['slide deck', 'presentation', 'auto layout'] },
  { id: 'plus-ai', name: 'Plus AI', url: 'https://plusdocs.com', category: 'Presentations', pricing: 'Freemium', description: 'Generates and redesigns slides right inside Google Slides.', tags: ['slide deck', 'google slides', 'presentation'] },
  { id: 'slidebean', name: 'Slidebean', url: 'https://slidebean.com', category: 'Presentations', pricing: 'Paid', description: "Turns your content into an investor-ready pitch deck.", tags: ['pitch deck', 'investor deck', 'presentation'] },

  // ---------- Translation ----------
  { id: 'deepl', name: 'DeepL', url: 'https://deepl.com', category: 'Translation', pricing: 'Freemium', description: 'Translation tool known for more natural-sounding phrasing than most.', tags: ['translation', 'translate', 'translate document', 'document translation', 'natural phrasing'] },
  { id: 'heygen-translate', name: 'HeyGen (video translation)', url: 'https://heygen.com', category: 'Translation', pricing: 'Freemium', description: 'Translates a talking-head video into another language, lips included.', tags: ['video translation', 'translate video', 'dubbing', 'lip sync'] },
]
