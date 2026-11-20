# Santa’s Toy Shop Production Playbook

## First PR

**Open a draft PR titled “Extract and test the ornament workshop engine.”** Use the current `santas-toy-shop.html` as the baseline. This workspace has no Git checkout. Confirm the destination repository before pushing a branch. The plan assumes a standalone, static browser game and a private preview until Eric approves publication.

## Release scope

Players help elves craft the Twelve Days of Christmas ornaments in order, fill twelve shipping batches, and spend coins on elves that craft automatically. Each hired elf makes one ornament per second. The first order requires 12 ornaments and gives players 45 seconds. Later batches add four ornaments and three seconds per order. The first craft starts the clock, and later clocks start when the previous batch ships. Missing a departure keeps inventory and forfeits that batch’s time bonus. Progress persists in the same browser. Closing the game or hiding its tab pauses production and deadlines.

Use the existing ornament collection as the candidate artwork. Keep game time independent of the Advent calendar’s real-world door schedule. The game can be linked from the calendar as a later integration if Eric chooses that destination.

## Section 1 — Game rules and saves

### PR 1 · Extract and test the game engine

- Preserve the prototype as the reference. Separate game rules and ornament definitions from rendering and storage. Give the engine an explicit elapsed-time input so it can be exercised without a browser or real-time waits.
- Implement craft, hire, advance time, ship, and restart as testable actions. Keep coins, stock, elapsed time, and completion consistent at the instant of an action.
- Add automated cases for all twelve orders, capped inventory, unaffordable hires, empty or partial shipments, duplicate shipment attempts, reward boundaries, and restart. Verify first shipment pays 19 coins when loaded immediately and 15 after the first missed departure. At the exact cutoff the departure counts as missed.
- **Merge gate:** Existing gameplay still works through its normal buttons. Automated checks pass in CI. No artwork or balancing changes in this PR.
- **After merge:** Start PR 2 once the full twelve-order test runs on the default branch.

### PR 2 · Harden save and timer behavior

- Add a versioned save format and migrate the prototype save, including older saves without a missed-departure flag. Validate values against the current day and batch limits. Handle unreadable saves and unavailable storage with plain-language feedback.
- Persist successful actions and pause and resume the elapsed timer on tab visibility changes. Keep progress across reloads and define a single active game tab policy so stale tabs cannot silently overwrite newer progress.
- Test old saves, malformed and unsupported saves, blocked storage, pause and resume, reload after a missed cutoff, and two open tabs. Confirm restart requires deliberate input and clears progress only after confirmation.
- **Merge gate:** Reload restores the same day, stock, coins, elf count, and pending reward eligibility. Hidden or closed time adds no progress. A storage failure leaves the current session playable.
- **After merge:** Start PR 3 once the migration and browser resume checks pass.

## Section 2 — Player experience

### PR 3 · Add the twelve collectible ornaments

- Map one approved artwork crop to each day. Use lightweight responsive images with fixed dimensions and a text fallback. Show the active ornament on the workbench and mark each shipped design in the collection.
- Make craft, hiring, deadline, and shipment controls usable on mobile and by keyboard. Keep focus visible and preserve it across ordinary state updates. Announce important changes such as a shipment or missed departure without announcing every timer tick.
- **Merge gate:** Review all twelve names and artwork mappings. Complete an order by keyboard and by touch, check the finished collection, confirm the layout fits a 320 px viewport, and verify reduced-motion behavior.
- **After merge:** Start PR 4 with the approved artwork and the current balance as the baseline.

### PR 4 · Tune the shipping loop

- Play the entire game on desktop and touch, including one run with an intentionally missed departure. Record time per order, clicks, hires, missed deadlines, and any point where automation removes meaningful decisions. Keep the first elf affordable after the first order even if the departure was missed.
- Explain the time bonus and carryover in the interface. Make the active departure and next action clear when a batch is ready. Confirm every ornament can be completed using manual crafting alone.
- **Merge gate:** Finish the game using manual crafting and using elf upgrades. Confirm missed deadlines are recoverable and a late shipment never receives a time bonus. Document any changed timing or economy values and update tests.
- **After merge:** Start PR 5 and cut a release candidate from the merged commit.

## Section 3 — Release

### PR 5 · Verify the private release candidate

- Build a reproducible static bundle from a clean checkout. Run automated rules and save checks in CI. On the preview, check start, craft, hire, ship, missed departure, reload, and completion in desktop Chrome, Firefox, and Safari, plus mobile Safari and Chrome.
- Check for missing artwork, console errors, broken paths under the intended hosting subdirectory, and unintended external requests. Verify that a normal update preserves the release candidate’s saved progress. Rehearse restoring the previous build and verify it handles the current save format before relying on rollback.
- **Merge gate:** Attach the preview URL, tested browsers, build identifier, and rollback procedure to the PR. Any issue that blocks shipping, loses progress, or prevents keyboard play blocks release.
- **After merge:** Send Eric the private preview and request approval for the public destination and release. After approval, deploy the tested build and repeat the main smoke checks on the public URL.

## After every merge

Record the merged PR URL and commit, verify the acceptance checks on the default branch, and identify the single next PR with its dependency and first task. If a merge introduces a regression, fix it before starting dependent work. Leave this sequence open at **PR 1** until the destination repository is confirmed. No PR has been opened or merged as part of writing this playbook.
