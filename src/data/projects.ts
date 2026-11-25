const owner = 'AdityaDugar11';
export const profileUrl = 'https://github.com/' + owner;

export interface Project {
  slug: string;
  title: string;
  category: string;
  summary: string;
  note: string;
  tools: string[];
  drawing: string;
  paper: string;
}

// The local edition preserves the author's verified pin order on an offline build.
const edition: Project[] = [
  {
    slug: 'SIH-AI-Driven-Scheme-Matching-for-Marginalized-Entrepreneurs',
    title: 'SchemeMatcher',
    category: 'AI / Public services',
    summary: 'Helping entrepreneurs find government schemes that fit their circumstances.',
    note: 'The first hurdle is figuring out which schemes apply. A profile brings relevant schemes together, with eligibility reasoning, multilingual navigation and a place to track applications.',
    tools: ['React', 'FastAPI', 'Gemini', 'Supabase'],
    drawing: 'schemes', paper: 'lime',
  },
  {
    slug: 'AI-Content-Generation-Automation-Pipeline-n8n-ComfyUI',
    title: 'Content Automation',
    category: 'Automation / Media',
    summary: 'From a written prompt to a finished frame, through a chain of local tools.',
    note: 'Ollama writes the idea and caption. An n8n workflow passes the visual prompt to ComfyUI, waits for the render, then hands the finished media to the publishing workflow.',
    tools: ['n8n', 'Ollama', 'ComfyUI'],
    drawing: 'media', paper: 'charcoal',
  },
  {
    slug: 'FAQ-RAG-Support-Agent',
    title: 'FAQ Support Agent',
    category: 'Retrieval / Support',
    summary: 'A support assistant that looks up answers and hands tricky questions to a person.',
    note: 'The workflow searches for a relevant FAQ, escalates more complex requests to a human through Slack and keeps a record of the interaction in Airtable.',
    tools: ['n8n', 'Groq', 'Slack', 'Airtable'],
    drawing: 'retrieval', paper: 'dots',
  },
  {
    slug: 'FlowGuard-AI',
    title: 'FlowGuard AI',
    category: 'Fintech / Prototype',
    summary: 'An experiment in choosing payment routes and spotting unusual transactions.',
    note: 'This hackathon prototype combines a rules engine with anomaly detection. A dashboard shows the risk assessment and the reasoning behind a proposed payment route.',
    tools: ['React', 'FastAPI', 'Python'],
    drawing: 'risk', paper: 'dots',
  },
  {
    slug: 'Lead-Qualification-Agent',
    title: 'Lead Qualification',
    category: 'Automation / Sales',
    summary: 'Turning a first enquiry into a scored lead a team can follow up on.',
    note: 'A form sends a message to n8n. The workflow assesses intent, urgency and budget, records the result in Airtable and can alert the team through Slack.',
    tools: ['n8n', 'Groq', 'Airtable'],
    drawing: 'leads', paper: 'lime',
  },
  {
    slug: 'AgriVision-Pro',
    title: 'AgriVision Pro',
    category: 'AI / Agriculture',
    summary: 'A conversational prototype exploring crop-health questions over WhatsApp.',
    note: 'Crop names and locations supply the context for a text-generated response. The prototype simulates crop assessment and uses Twilio to connect the conversation to WhatsApp.',
    tools: ['Python', 'FastAPI', 'Twilio'],
    drawing: 'crop', paper: 'charcoal',
  },
];

type Pin = { nameWithOwner: string; description?: string };
type LinkedProject = Project & { url: string };
const repoPath = /^[\w.-]+\/[\w.-]+$/;

async function loadPins(): Promise<Pin[]> {
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    const result = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query($login:String!){user(login:$login){pinnedItems(first:6,types:REPOSITORY){nodes{...on Repository{nameWithOwner description}}}}}',
        variables: { login: owner },
      }),
      signal: AbortSignal.timeout(4000),
    });
    const payload = await result.json();
    const pins = payload.data?.user?.pinnedItems?.nodes;
    if (!result.ok || !Array.isArray(pins) || pins.some(pin => !repoPath.test(pin.nameWithOwner))) {
      throw new Error('Unable to read pinned repositories');
    }
    return pins;
  }

  const result = await fetch(profileUrl, { signal: AbortSignal.timeout(4000) });
  if (!result.ok) throw new Error('GitHub profile unavailable');
  const html = await result.text();
  if (!/<h2\b[^>]*>\s*Pinned\b/i.test(html)) {
    // GitHub switches this heading when a profile has no explicit pins.
    if (/<h2\b[^>]*>\s*Popular repositories\b/i.test(html)) return [];
    throw new Error('Pinned section unavailable');
  }
  const pins: Pin[] = [];
  for (const [anchor] of html.matchAll(/<a\b[^>]*?PINNED_REPO[^>]*>/g)) {
    const path = anchor.match(/\bhref="\/([\w.-]+\/[\w.-]+)"/)?.[1];
    if (path && !pins.some(pin => pin.nameWithOwner === path)) pins.push({ nameWithOwner: path });
  }
  if (!pins.length) throw new Error('Pinned links unavailable');
  return pins.slice(0, 6);
}

export async function getProjects(): Promise<LinkedProject[]> {
  let pins: Pin[];
  try {
    pins = await loadPins();
  } catch {
    console.warn('Using the saved edition of Aditya’s GitHub pins.');
    pins = edition.map(project => ({ nameWithOwner: owner + '/' + project.slug }));
  }
  return pins.map(({ nameWithOwner, description }) => {
    const url = 'https://github.com/' + nameWithOwner;
    const known = edition.find(project => owner + '/' + project.slug === nameWithOwner);
    if (known) return { ...known, url };
    const slug = nameWithOwner.split('/')[1];
    return {
      slug, url, title: slug.replace(/[-_]+/g, ' '), category: 'Pinned repository',
      summary: description || 'An entry from my public project notebook.',
      note: 'The repository holds the latest project notes and source code.',
      tools: [], drawing: 'source', paper: 'dots',
    };
  });
}
