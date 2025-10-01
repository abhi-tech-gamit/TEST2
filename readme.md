# Lyrics Collection

A web application for managing and viewing song lyrics with chords. Features include transposing chords, dark mode, and PDF export.

## Features

- **Song Management**: Add, view, and delete songs (admin only)
- **Transposition**: Change the key of a song with transposition controls
- **Search & Filter**: Search by song title or artist, filter by category
- **Dark/Light Theme**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Swipe Navigation**: Swipe left/right on mobile to navigate between songs
- **PDF Export**: Download lyrics as a PDF file
- **Data Storage**: Songs stored in JSON file within the repository

## Admin Login

To access admin features (add/delete songs), use the following credentials:
- Username: `Abhi`
- Password: `Gamitn@1975`

## Usage

1. Open `index.html` in a web browser.
2. Browse songs by category or search for a specific song.
3. Click on a song to view its lyrics and chords.
4. Use the transposition controls to change the key.
5. Admin users can add new songs or delete existing ones.

## Adding New Songs

1. Log in as an admin using the credentials above.
2. Click the "Add Song" button.
3. Fill in the song details and lyrics with chords.
4. Click "Save Song".
5. **Important**: After adding a song, you need to:
   - Copy the new song data from the browser console
   - Add it to the `data/songs.json` file
   - Commit and push the changes to GitHub

## Technologies Used

- HTML5
- CSS3 (with custom properties for theming)
- Vanilla JavaScript
- Font Awesome (for icons)
- jsPDF (for PDF generation)

## Data Storage

Songs are stored in `data/songs.json` as part of the repository. When you add new songs through the admin interface, you need to manually update this file to make the changes permanent.

## License

MIT