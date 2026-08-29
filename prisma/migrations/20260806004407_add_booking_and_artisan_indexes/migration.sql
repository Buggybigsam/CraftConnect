-- CreateIndex
CREATE INDEX "ArtisanProfile_status_idx" ON "ArtisanProfile"("status");

-- CreateIndex
CREATE INDEX "ArtisanProfile_category_idx" ON "ArtisanProfile"("category");

-- CreateIndex
CREATE INDEX "ArtisanProfile_location_idx" ON "ArtisanProfile"("location");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_artisanId_idx" ON "Booking"("artisanId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
