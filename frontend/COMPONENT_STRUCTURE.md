# Component Structure

## Core Components
- **Navbar**: Top navigation links (Discovery, Dashboard, Admin).
- **EventCard**: Card displaying event details, required skills (as `SkillBadge`), and match percentage (as `ScoreRing`).
- **ScoreRing**: SVG circular progress indicator color-coded by match percentage.
- **SkillBadge**: Small pill displaying a skill and its status (matched, missing, neutral).
- **SearchBar**: Text input for filtering events.

## Pages
- **DiscoveryFeed**: Main listing of events with search and skill matching.
- **Dashboard**: Volunteer profile and top matched events.
- **AdminPanel**: Form to create new events and table of existing events.
