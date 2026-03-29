-- CreateIndex
CREATE INDEX "bookings_barber_id_date_status_idx" ON "bookings"("barber_id", "date", "status");

-- CreateIndex
CREATE INDEX "tokens_access_token_idx" ON "tokens"("access_token");

-- CreateIndex
CREATE INDEX "tokens_refresh_token_idx" ON "tokens"("refresh_token");

-- CreateIndex
CREATE INDEX "user_credentials_user_id_method_idx" ON "user_credentials"("user_id", "method");
