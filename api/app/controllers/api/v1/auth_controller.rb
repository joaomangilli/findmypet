module Api
  module V1
    class AuthController < ApplicationController
      # POST /api/v1/auth/send_otp
      def send_otp
        phone = params[:phone].to_s.strip
        return render_error("Telefone é obrigatório") if phone.blank?

        otp = OtpCode.generate_for(phone)

        message = build_otp_message(otp.code)
        WhatsappService.send_message(phone, message)

        render_success({ message: "Código enviado para #{phone}" })
      rescue => e
        Rails.logger.error("[AuthController#send_otp] #{e.message}")
        render_error("Erro ao enviar código. Tente novamente.", status: :service_unavailable)
      end

      # POST /api/v1/auth/verify_otp
      def verify_otp
        phone = params[:phone].to_s.strip
        code  = params[:code].to_s.strip
        name  = params[:name].to_s.strip

        return render_error("Telefone e código são obrigatórios") if phone.blank? || code.blank?

        otp = OtpCode.valid_for(phone).first
        return render_error("Código inválido ou expirado", status: :unauthorized) if otp.nil?
        return render_error("Código incorreto", status: :unauthorized) unless otp.code == code

        otp.use!

        user = User.find_or_initialize_by(phone: phone)
        user.name = name if name.present? && user.new_record?
        user.name ||= "Usuário"
        user.password = SecureRandom.hex(24) if user.new_record?
        user.save!

        token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

        render_success({
          token: token,
          user: { id: user.id, phone: user.phone, name: user.name }
        })
      end

      # DELETE /api/v1/auth/sign_out
      def sign_out
        # JWT revocation handled by JTIMatcher — just return 200
        render_success({ message: "Logout realizado" })
      end

      private

      def build_otp_message(code)
        <<~MSG.strip
          🐾 *FindMyPet* — Seu código de acesso:

          *#{code}*

          Válido por 10 minutos. Não compartilhe com ninguém.
        MSG
      end
    end
  end
end
