import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, role_type, stipend_range } = body;

    if (!company_name || !role_type || !stipend_range) {
      return NextResponse.json({
        status: "Bad Request",
        error: "Missing required fields: company_name, role_type, and stipend_range must be provided in JSON payload."
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Success Response
    return NextResponse.json({
      status: "Success",
      message: `Hire request received from ${company_name} for the ${role_type} role! Connection initialized.`,
      candidate_notification: "Sent",
      contact_email: "vanshvijay9784@gmail.com",
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "Internal Server Error",
      error: "Invalid JSON body provided."
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
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
