
// import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { Resend } from "npm:resend@2.0.0";

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConsultationEmailRequest {
  fullName: string;
  phone: string;
  courseName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, childName, email, phone, courseName }: ConsultationEmailRequest = await req.json();

    console.log("Sending consultation email with data:", { fullName, phone, courseName });

    const emailResponse = await resend.emails.send({
      from: "MC Training Center <onboarding@resend.dev>",
      to: ["linhquangtu07@gmail.com"], // Đổi thành email đã đăng ký với Resend
      subject: "Tiếp nhận thông tin đăng ký tư vấn khóa học",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Đăng ký tư vấn khóa học MC
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Thông tin khách hàng:</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Họ và tên phụ huynh:</strong>
              <span style="margin-left: 10px; color: #666;">${fullName}</span>
            </div>

            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Họ và tên bé:</strong>
              <span style="margin-left: 10px; color: #666;">${childName}</span>
            </div>

            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Email:</strong>
              <span style="margin-left: 10px; color: #666;">${email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Số điện thoại:</strong>
              <span style="margin-left: 10px; color: #666;">${phone}</span>
            </div>
            
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Khóa học quan tâm:</strong>
              <span style="margin-left: 10px; color: #666;">${courseName}</span>
            </div>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Lưu ý:</strong> Vui lòng liên hệ với khách hàng trong thời gian sớm nhất để tư vấn chi tiết về khóa học.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px;">
              Email được gửi từ hệ thống đăng ký tư vấn MC Training Center
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-consultation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
