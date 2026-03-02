{
  "rules": {
    "garcons": {
      "$garcom_id": {
        ".read": true,
        ".write": true,
        "mesas_ativas": {
          ".indexOn": ["status"]
        },
        "historico": {
          ".indexOn": ["fechadaEm"]
        }
      }
    }
  }
}