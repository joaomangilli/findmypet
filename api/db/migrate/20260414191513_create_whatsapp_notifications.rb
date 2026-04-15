class CreateWhatsappNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :whatsapp_notifications do |t|
      t.references :announcement, null: false, foreign_key: true
      t.references :subscriber, null: false, foreign_key: true
      t.integer  :status, null: false, default: 0
      t.datetime :sent_at

      t.timestamps
    end
  end
end
