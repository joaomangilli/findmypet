class SendAnnouncementNotificationsJob < ApplicationJob
  queue_as :default

  def perform(announcement_id)
    announcement = Announcement.includes(:pet, :user).find_by(id: announcement_id)
    return unless announcement&.active?

    location = announcement.last_seen_location
    return unless location

    lat    = location.y
    lng    = location.x
    radius = announcement.notification_radius_km

    subscribers = Subscriber.within_radius(lat, lng, radius)

    subscribers.find_each do |subscriber|
      SendWhatsappMessageJob.perform_later(announcement.id, subscriber.id)
    end
  end
end
