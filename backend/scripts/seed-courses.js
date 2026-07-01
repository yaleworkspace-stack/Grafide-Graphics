/**
 * GRAFIDE — Course Seed Script
 * ============================================
 * Seeds all 5 courses into MongoDB via the Grafide REST API.
 * Run this AFTER the backend is started and your admin account exists.
 *
 * Usage:
 *   node backend/scripts/seed-courses.js
 *
 * Requirements:
 *   node >= 16
 *   Backend running on http://localhost:8080
 *   Admin account already created in MongoDB
 */

const API = 'https://grafide-graphics-backend.onrender.com/api';
const ADMIN_EMAIL = 'enochlildon@gmail.com';
const ADMIN_PASSWORD = 'Jagaban1';

const COURSES = [
  {
    slug: 'coreldraw',
    name: 'CorelDRAW',
    tagline: 'Creating Designs Via CorelDRAW',
    category: 'Vector Design',
    published: true,
    levels: [
      {
        name: 'Beginner', order: 0,
        lessons: [
          { title: 'Introduction to CorelDRAW', order: 0, content: '<p>Welcome to CorelDRAW. In this lesson we cover the interface, toolbars, and your first document setup.</p><h4>What you will learn</h4><p>The workspace layout, how to create a new document, and navigating the toolbox.</p>', videoUrl: '', resources: [{ title: 'CorelDRAW Official Documentation', url: 'https://product.corel.com/coreldraw/', type: 'reference' }], published: true },
          { title: 'Drawing Basic Shapes', order: 1, content: '<p>Learn to draw rectangles, ellipses, polygons, and stars using CorelDRAW\'s shape tools.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Working with Colours and Fills', order: 2, content: '<p>Understand the colour palette, uniform fills, gradient fills, and the eyedropper tool.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Intermediate', order: 1,
        lessons: [
          { title: 'The Pen Tool and Bézier Curves', order: 0, content: '<p>Master the Bézier tool to draw precise curved paths and custom shapes.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Text and Typography', order: 1, content: '<p>Working with artistic text, paragraph text, and text on a path.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Working with Layers', order: 2, content: '<p>Organise your designs using the Object Manager and layer system.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Advanced', order: 2,
        lessons: [
          { title: 'Print-Ready Artwork Setup', order: 0, content: '<p>Preparing files for professional print — bleed, crop marks, colour profiles, and PDF export.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Logo Design Project', order: 1, content: '<p>Apply everything you\'ve learned to design a complete logo from brief to final file.</p>', videoUrl: '', resources: [], published: true }
        ]
      }
    ]
  },
  {
    slug: 'photoshop',
    name: 'Photoshop',
    tagline: 'Creating Designs Via Photoshop',
    category: 'Photo Editing',
    published: true,
    levels: [
      {
        name: 'Beginner', order: 0,
        lessons: [
          { title: 'The Photoshop Interface', order: 0, content: '<p>Get familiar with the workspace: panels, tools, menus, and how Photoshop handles files.</p>', videoUrl: '', resources: [{ title: 'Adobe Photoshop Learn & Support', url: 'https://helpx.adobe.com/photoshop/user-guide.html', type: 'reference' }], published: true },
          { title: 'Understanding Layers', order: 1, content: '<p>The foundation of everything in Photoshop. Learn to create, name, group, and manage layers.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Selection Tools', order: 2, content: '<p>Marquee, Lasso, Quick Select, and Magic Wand — when to use each and how to refine selections.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Intermediate', order: 1,
        lessons: [
          { title: 'Masking and Compositing', order: 0, content: '<p>Layer masks, clipping masks, and how to blend images seamlessly.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Adjustment Layers and Colour Grading', order: 1, content: '<p>Non-destructive colour corrections using Curves, Levels, Hue/Saturation, and Color Balance.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Retouching and Healing', order: 2, content: '<p>Spot Healing Brush, Clone Stamp, Content-Aware Fill — fixing imperfections professionally.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Advanced', order: 2,
        lessons: [
          { title: 'Smart Objects and Filters', order: 0, content: '<p>Work non-destructively with Smart Objects, Camera RAW as a filter, and advanced blending.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Actions and Batch Processing', order: 1, content: '<p>Automate repetitive tasks with Actions and apply them to entire folders of images.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Final Project: Photo Manipulation', order: 2, content: '<p>Combine everything — masking, compositing, colour grading — into a finished photo manipulation piece.</p>', videoUrl: '', resources: [], published: true }
        ]
      }
    ]
  },
  {
    slug: 'illustrator',
    name: 'Adobe Illustrator',
    tagline: 'Creating Designs Via Adobe Illustrator',
    category: 'Illustration',
    published: true,
    levels: [
      {
        name: 'Beginner', order: 0,
        lessons: [
          { title: 'Welcome to Illustrator', order: 0, content: '<p>Illustrator vs Photoshop — understanding vector vs raster, and navigating the Illustrator workspace.</p>', videoUrl: '', resources: [{ title: 'Adobe Illustrator User Guide', url: 'https://helpx.adobe.com/illustrator/user-guide.html', type: 'reference' }], published: true },
          { title: 'The Pen Tool', order: 1, content: '<p>The most important tool in Illustrator. Master anchor points, handles, and path editing.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Shapes and Pathfinder', order: 2, content: '<p>Combine, subtract, and intersect shapes using the Pathfinder panel to build complex forms.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Intermediate', order: 1,
        lessons: [
          { title: 'Typography in Illustrator', order: 0, content: '<p>Type tools, text on a path, outline text, and creating typographic compositions.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Colour and Gradients', order: 1, content: '<p>Swatches, global colours, gradient mesh, and building consistent colour palettes.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Symbols and Patterns', order: 2, content: '<p>Create repeating patterns and reusable symbols for efficient, scalable design.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Advanced', order: 2,
        lessons: [
          { title: 'Icon Design System', order: 0, content: '<p>Design a consistent set of icons using grids, alignment, and unified stroke weights.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Logo Design and Brand Identity', order: 1, content: '<p>From concept to final vector — designing a complete logo with variations and brand guidelines.</p>', videoUrl: '', resources: [], published: true }
        ]
      }
    ]
  },
  {
    slug: 'msword',
    name: 'Microsoft Word',
    tagline: 'Creating Designs Via Microsoft Word',
    category: 'Layout & Type',
    published: true,
    levels: [
      {
        name: 'Beginner', order: 0,
        lessons: [
          { title: 'Word as a Design Tool', order: 0, content: '<p>Most people underestimate Word. This lesson reframes it as a layout and typography tool capable of professional output.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Styles, Headings, and Hierarchy', order: 1, content: '<p>Using Word\'s Styles system to create consistent, professional document typography.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Page Layout and Sections', order: 2, content: '<p>Margins, columns, section breaks, headers and footers — laying out a document professionally.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Intermediate', order: 1,
        lessons: [
          { title: 'Images, Tables, and Text Boxes', order: 0, content: '<p>Positioning and wrapping images, designing clean tables, and using text boxes for layout flexibility.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Designing with Shapes', order: 1, content: '<p>Word\'s drawing tools for creating infographics, callouts, and visual elements within documents.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Advanced', order: 2,
        lessons: [
          { title: 'Building a Professional Report', order: 0, content: '<p>Table of contents, numbered headings, page numbering, and print-ready PDF export.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Designing a Letterhead and Template', order: 1, content: '<p>Create a reusable branded letterhead template with logo placement and consistent styling.</p>', videoUrl: '', resources: [], published: true }
        ]
      }
    ]
  },
  {
    slug: 'canva',
    name: 'Canva',
    tagline: 'Creating Designs Via Canva',
    category: 'Quick Design',
    published: true,
    levels: [
      {
        name: 'Beginner', order: 0,
        lessons: [
          { title: 'Getting Started with Canva', order: 0, content: '<p>Creating an account, exploring templates, and understanding the Canva editor interface.</p>', videoUrl: '', resources: [{ title: 'Canva Design School', url: 'https://www.canva.com/learn/', type: 'reference' }], published: true },
          { title: 'Working with Templates', order: 1, content: '<p>Customising templates for social media posts, presentations, and flyers — changing fonts, colours, and images.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Typography in Canva', order: 2, content: '<p>Font pairing, text hierarchy, and making your words part of the design rather than an afterthought.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Intermediate', order: 1,
        lessons: [
          { title: 'Brand Kit and Consistency', order: 0, content: '<p>Setting up a Brand Kit with your colours, fonts, and logo for consistent output across all designs.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Social Media Content Creation', order: 1, content: '<p>Designing for Instagram, Facebook, Twitter/X, and LinkedIn — sizing, formats, and best practices.</p>', videoUrl: '', resources: [], published: true }
        ]
      },
      {
        name: 'Advanced', order: 2,
        lessons: [
          { title: 'Presentations and Pitch Decks', order: 0, content: '<p>Designing compelling presentations — slide hierarchy, data visualisation, and storytelling with layout.</p>', videoUrl: '', resources: [], published: true },
          { title: 'Final Project: Full Brand Package', order: 1, content: '<p>Design a complete brand package: logo variant, business card, social media banner, and presentation template.</p>', videoUrl: '', resources: [], published: true }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('\n🌱  GRAFIDE COURSE SEEDER\n' + '─'.repeat(40));
  console.log('→ Authenticating as admin...');
  let token;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const data = await res.json();
    if (!res.ok || data.user?.role !== 'ADMIN') {
      console.error('✗ Login failed or account is not ADMIN:', data.message || data);
      process.exit(1);
    }
    token = data.token;
    console.log(`✓ Logged in as ${data.user.name} (${data.user.role})\n`);
  } catch (err) {
    console.error('✗ Cannot reach backend at', API);
    console.error('  Make sure the backend is running: mvn spring-boot:run');
    process.exit(1);
  }

  const existingRes = await fetch(`${API}/courses`, { headers: { Authorization: `Bearer ${token}` } });
  const existingList = await existingRes.json();
  const existingSlugs = existingList.map(c => c.slug);

  let created = 0, skipped = 0, failed = 0;

  for (const course of COURSES) {
    process.stdout.write(`→ ${course.name.padEnd(22)}`);
    if (existingSlugs.includes(course.slug)) {
      console.log('SKIP (already exists)');
      skipped++;
      continue;
    }

    try {
      const res = await fetch(`${API}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(course)
      });

      if (res.ok) {
        const saved = await res.json();
        const lessons = saved.levels?.reduce((a, l) => a + l.lessons.length, 0) || 0;
        console.log(`✓ Created  (id: ${saved.id}, ${lessons} lessons)`);
        created++;
      } else {
        const err = await res.json();
        console.log(`✗ Failed   (${err.message || res.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`✗ Error    (${err.message})`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(40));
  console.log(`✓ Created : ${created}`);
  console.log(`  Skipped : ${skipped}`);
  if (failed) console.log(`✗ Failed  : ${failed}`);
  console.log('─'.repeat(40));

  if (created > 0) {
    console.log('\n✅ Seeding complete.');
    console.log('   Open the admin panel → Courses to confirm.');
    console.log('   Open a course page to see lessons loading.\n');
  } else if (skipped === COURSES.length) {
    console.log('\n⚠  All courses already exist. Nothing to seed.');
    console.log('   To re-seed, delete existing courses from MongoDB first:\n');
    console.log('   mongosh grafide --eval "db.courses.deleteMany({})"');
    console.log('   Then run this script again.\n');
  }
}

seed();
