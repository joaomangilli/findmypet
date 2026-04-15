class CreateOtpCodes < ActiveRecord::Migration[8.1]
  def change
    create_table :otp_codes do |t|
      t.string   :phone,      null: false
      t.string   :code,       null: false
      t.datetime :expires_at, null: false
      t.boolean  :used,       null: false, default: false

      t.timestamps
    end

    add_index :otp_codes, :phone
  end
end
