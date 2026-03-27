

## Remove Stripe payment info card from Subscription page

**What**: Remove the "Pagamento com PIX ou Cartão" card (lines 86-103) from `src/pages/Subscription.tsx`. This card was used for Stripe payment info and is no longer needed since payments are handled via Hotmart.

**Changes**:
- **`src/pages/Subscription.tsx`**: Delete lines 86-103 (the `{/* Payment Methods Info */}` section with the card containing the credit card icon, title, and description). Also remove the `CreditCard` import from lucide-react if no longer used elsewhere.

