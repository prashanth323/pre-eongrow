-- Revoke execute from authenticated for strictly backend-only functions
REVOKE EXECUTE ON FUNCTION public.activate_subscription(UUID, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_payment(UUID, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_payment_order(UUID, public.payment_purpose, NUMERIC, TEXT, UUID, TEXT, NUMERIC, NUMERIC, JSONB) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_event_ticket(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_overdue_subscriptions() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Ensure service_role can still execute them
GRANT EXECUTE ON FUNCTION public.activate_subscription(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_payment(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_payment_order(UUID, public.payment_purpose, NUMERIC, TEXT, UUID, TEXT, NUMERIC, NUMERIC, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.issue_event_ticket(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_overdue_subscriptions() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
