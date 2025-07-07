## Dev

Add a new voting list using e.g.

```bash
curl https://raw.githubusercontent.com/multimeric/Hottest100VotingLists/refs/heads/master/2024/voting_list.json | node --experimental-transform-types make_voting_list.ts > public/2024.json
curl https://raw.githubusercontent.com/multimeric/Hottest100VotingLists/refs/heads/master/2025-australian/voting_list.json | node --experimental-transform-types make_voting_list.ts > public/2025_australian.json
```