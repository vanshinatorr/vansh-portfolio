import { NextResponse } from 'next/server';

export async function GET() {
  const profile = {
    status: "Available",
    target_roles: ["SDE Intern", "Full Stack Developer", "Backend Engineer"],
    current_locations: ["Jaipur, India", "Remote"],
    contact_email: "vanshvijay9784@gmail.com",
    socials: {
      linkedin: "https://www.linkedin.com/in/vansh-vijay/",
      github: "https://github.com/vanshinatorr",
      twitter: "https://x.com/vanshvijay9"
    }
  };

  return NextResponse.json(profile, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
