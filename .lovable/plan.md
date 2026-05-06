# Ajuste de padding inferior do Paywall

Em `src/components/PaywallScreen.tsx`, alterar o `pb` do container externo de:

```
pb-[calc(env(safe-area-inset-bottom)+2rem)]
```

para:

```
pb-[calc(env(safe-area-inset-bottom)+7rem)]
```

para garantir que o card fique acima do Navbar tubelight inferior (que tem ~5rem de altura + margem).
