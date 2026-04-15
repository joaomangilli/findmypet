class SendWhatsappMessageJob < ApplicationJob
  queue_as :default
  sidekiq_options retry: 3

  def perform(announcement_id, subscriber_id)
    announcement = Announcement.includes(:pet).find_by(id: announcement_id)
    subscriber   = Subscriber.find_by(id: subscriber_id)

    return unless announcement && subscriber

    notification = WhatsappNotification.find_or_create_by!(
      announcement: announcement,
      subscriber: subscriber
    )
    return if notification.sent?

    message = build_message(announcement, subscriber)
    WhatsappService.send_message(subscriber.phone, message)

    notification.update!(status: :sent, sent_at: Time.current)
  rescue => e
    WhatsappNotification.find_by(
      announcement_id: announcement_id,
      subscriber_id: subscriber_id
    )&.update(status: :failed)
    raise
  end

  private

  def build_message(announcement, subscriber)
    pet        = announcement.pet
    app_url    = ENV.fetch("APP_URL") { "http://localhost:3000" }
    detail_url = "#{app_url}/announcements/#{announcement.id}"

    species_label = Pet::SPECIES_LABELS.fetch(pet.species, pet.species)

    <<~MSG.strip
      🐾 *PET PERDIDO NA SUA ÁREA* 🐾

      *#{pet.name}* (#{species_label}#{pet.breed.present? ? " - #{pet.breed}" : ""})
      📍 Visto pela última vez em: #{announcement.last_seen_address}
      🕐 #{announcement.last_seen_at&.strftime("%d/%m/%Y às %H:%M")}

      *Descrição:* #{announcement.description}

      Você viu esse pet? Clique para ajudar:
      #{detail_url}
    MSG
  end
end
