# HealthWise — Health Awareness Campaign Using Mobile Application

A responsive student-project website made with HTML, CSS and JavaScript. It includes health information, a 5-question quiz, feedback form, and a results dashboard.

## Important: demo mode vs shared live mode

- **Demo mode (works immediately):** quiz and feedback submissions are saved in the current browser's `localStorage`. They do not sync to another device or browser.
- **Shared live mode (recommended before publishing):** connect a Supabase database. All visitors' submissions can then be counted in the same dashboard.

Do not claim demo-mode responses represent all visitors. The dashboard only counts actual submissions recorded in its current storage/database.

## Run on your computer

1. Extract the ZIP.
2. Open `index.html` in a browser.
3. Try the quiz and submit feedback.
4. Refresh the page to see that demo data stays in the same browser.

A local development server is preferable, but opening the HTML file works for demo mode.

## Connect a shared database with Supabase (free tier may be available)

1. Create a project at https://supabase.com/.
2. In the Supabase dashboard, open **SQL Editor** and run the entire contents of `supabase.sql`.
3. Open **Project Settings → API** (or the project's API keys area). Copy the **Project URL** and the **publishable/anon key**.
4. Open `app.js` in a text editor.
5. Replace the two empty values at the top:

   ```js
   const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY";
   ```

   Use only the public anon/publishable key. **Never put a `service_role` or secret key in browser code.**
6. Save and refresh the website. The yellow demo notice should change to a green “Connected to Supabase” notice.
7. Test from a second browser/device. Submit one quiz and one feedback response, then confirm the dashboard counts change.

### Privacy note

The public dashboard shows anonymized written comments from feedback forms when the visitor consents. Names are not displayed. The public policies in `supabase.sql` allow visitors to read quiz scores and consented feedback rows, so don't collect private health information. For a larger or real public campaign, use server-side aggregation and stronger anti-spam/rate-limit controls.

## Publish online using Netlify (simple option)

1. Finish testing the shared database first if you want responses from multiple visitors to be collected together.
2. Go to https://www.netlify.com/ and sign in or create an account.
3. Choose **Add new site → Deploy manually** (wording may change).
4. Drag the extracted `health_awareness_campaign` folder into the deploy area, or use Netlify's current manual deploy flow.
5. Netlify will provide a public website URL. Open it on your phone to test the responsive layout.
6. If you change the code later, deploy the updated folder again.

You can also use GitHub Pages for a static version, but Netlify's manual upload flow is beginner-friendly. A static host is enough because the shared data is stored in Supabase.

## Project structure

- `index.html` — page sections and forms
- `style.css` — responsive styling
- `app.js` — quiz, feedback, dashboard and database connection
- `supabase.sql` — database tables and access policies

## Suggested project description

**Aim:** To design and develop a mobile-friendly health awareness campaign website that shares basic wellness information, assesses visitor knowledge through an interactive quiz, collects campaign feedback, and presents participation statistics and feedback trends on a dashboard.

**Tools used:** HTML5, CSS3, JavaScript, Supabase (database), Netlify (hosting).

**Note:** This is an educational awareness project, not a medical diagnosis or treatment tool.
