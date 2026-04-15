class WhatsappNotification < ApplicationRecord
  belongs_to :announcement
  belongs_to :subscriber

  enum :status, { pending: 0, sent: 1, failed: 2 }
end
