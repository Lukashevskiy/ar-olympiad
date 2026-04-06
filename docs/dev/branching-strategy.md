# Branching Strategy

Repository branch model:

- `main`: stable public branch with approved reference state.
- `all`: full integrated solution branch with all tasks assembled together.
- `debug`: isolated branch for debug tooling, developer panels, gizmos, and synthetic scene workflows.
- `task-1`: isolated branch for the field reconstruction solution.
- `task-2`: isolated branch for object detection / segmentation work.
- `task-3`: isolated branch for light marker and light pose work.
- `task-4`: isolated branch for shadow projection work.
- `docs/...`: documentation-only branches when changes do not affect solution code.
- `refactor/...`: internal cleanup branches.

Recommended usage:

- develop each olympiad task in its own branch when the work is self-contained;
- keep debug-only improvements in `debug` so they do not pollute task-only solution branches;
- merge selected debug improvements into task branches only when they are needed to explain or validate the solution;
- merge `task-1`, `task-2`, `task-3`, `task-4`, and selected parts of `debug` into `all`;
- promote reviewed snapshots from `all` into `main`.

Suggested flow:

1. `task-1` contains the isolated field solution.
2. `debug` contains shared developer instrumentation and non-essential debug UX.
3. `all` contains the integrated end-to-end solution.
4. `main` is used for the final stable reference version.

Practical benefit:

- it is easy to share only the code for one olympiad task;
- it is easy to point reviewers to the integrated branch;
- debug utilities remain available without mixing them into every task branch by default.
