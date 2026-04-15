class Subscriber < ApplicationRecord
  has_many :whatsapp_notifications, dependent: :destroy

  validates :phone, presence: true, uniqueness: true
  validates :name,  presence: true
  validates :notification_radius_km, numericality: { greater_than: 0, less_than_or_equal_to: 100 }

  # Finds subscribers whose location falls within `radius_km` of the given point.
  # Uses simple bounding-box math — PostGIS not required for subscribers since
  # they store plain lat/lng decimals. Announcement locations use PostGIS.
  scope :within_radius, ->(lat, lng, radius_km) {
    return none if lat.blank? || lng.blank?

    # 1 degree ≈ 111 km
    delta = radius_km.to_f / 111.0
    where(
      "lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
      lat - delta, lat + delta,
      lng - delta, lng + delta
    )
  }
end
