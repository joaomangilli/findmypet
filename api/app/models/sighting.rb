class Sighting < ApplicationRecord
  belongs_to :announcement
  belongs_to :user, optional: true  # anônimos não precisam de conta

  validates :saw_it, inclusion: { in: [ true, false ] }

  # Requer nome ou user_id para identificar o reporter
  validate :reporter_identified

  private

  def reporter_identified
    return if user_id.present? || reporter_name.present?
    errors.add(:base, "Informe seu nome para reportar")
  end
end
