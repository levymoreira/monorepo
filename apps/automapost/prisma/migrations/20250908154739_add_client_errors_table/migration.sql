-- CreateTable
CREATE TABLE "client_errors" (
    "id" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "errorType" TEXT NOT NULL DEFAULT 'javascript',
    "severity" TEXT NOT NULL DEFAULT 'error',
    "url" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_errors_createdAt_idx" ON "client_errors"("createdAt");

-- CreateIndex
CREATE INDEX "client_errors_errorType_idx" ON "client_errors"("errorType");

-- CreateIndex
CREATE INDEX "client_errors_severity_idx" ON "client_errors"("severity");

-- CreateIndex
CREATE INDEX "client_errors_userId_idx" ON "client_errors"("userId");

-- AddForeignKey
ALTER TABLE "client_errors" ADD CONSTRAINT "client_errors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;