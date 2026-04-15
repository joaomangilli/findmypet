class WhatsappService
  BASE_URL   = ENV.fetch("EVOLUTION_API_URL") { "http://localhost:8080" }
  API_KEY    = ENV.fetch("EVOLUTION_API_KEY") { "" }
  INSTANCE   = ENV.fetch("EVOLUTION_INSTANCE") { "findmypet" }

  def self.send_message(phone, text)
    new.send_message(phone, text)
  end

  def send_message(phone, text)
    normalized = normalize_phone(phone)
    connection.post("/message/sendText/#{INSTANCE}") do |req|
      req.headers["apikey"] = API_KEY
      req.headers["Content-Type"] = "application/json"
      req.body = {
        number: normalized,
        text: text
      }.to_json
    end
  rescue Faraday::Error => e
    Rails.logger.error("[WhatsappService] Erro ao enviar para #{phone}: #{e.message}")
    raise
  end

  private

  def connection
    @connection ||= Faraday.new(url: BASE_URL) do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
    end
  end

  def normalize_phone(phone)
    # Remove tudo exceto dígitos e o + inicial
    phone.to_s.gsub(/[^\d+]/, "")
  end
end
