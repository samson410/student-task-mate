import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing tasks for suggestions:', tasks.length);

    // Prepare task data for AI
    const taskSummary = tasks.map((task: any) => 
      `- ${task.title} (${task.status}, ${task.priority} priority, category: ${task.category}${task.due_date ? `, due: ${new Date(task.due_date).toLocaleDateString()}` : ''})`
    ).join('\n');

    const systemPrompt = `You are a productivity assistant helping users prioritize their tasks. Analyze the user's task list and provide 3-5 actionable suggestions on what they should do next.

Consider:
- Task priorities (high, medium, low)
- Due dates and urgency
- Task categories
- Current task status
- Work-life balance

Return suggestions as a JSON array with this structure:
[
  {
    "title": "Focus on X task",
    "priority": "high",
    "category": "work",
    "reasoning": "Why this is important"
  }
]`;

    const userPrompt = `Here are my current tasks:\n\n${taskSummary}\n\nWhat should I focus on next? Provide 3-5 specific, actionable suggestions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tasks",
              description: "Return 3-5 actionable task suggestions.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        category: { type: "string" },
                        reasoning: { type: "string" }
                      },
                      required: ["title", "priority", "category", "reasoning"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract suggestions from tool call
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments).suggestions;

    return new Response(
      JSON.stringify({ suggestions }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-tasks function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});