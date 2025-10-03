// Sidebar toggle
const burger = document.getElementById("burger");
const sidebar = document.getElementById("sidebar");
burger.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadDashboard() {
  try {
    const res = await fetch("dashboard_data/product6.json");
    const data = await res.json();

    // Product Name + Rating
    document.getElementById("productName").textContent = data.product_name;
    document.getElementById("avgRating").textContent = Number(data.avg_rating).toFixed(2);

    // Get CSS variables for chart colors
    const chartPositive = getComputedStyle(document.documentElement).getPropertyValue('--chart-positive').trim();
    const chartNegative = getComputedStyle(document.documentElement).getPropertyValue('--chart-negative').trim();
    const chartNeutral = getComputedStyle(document.documentElement).getPropertyValue('--chart-neutral').trim();

    // Sentiment breakdown
    const raw = {
      positive: Number(data.sentiment_breakdown.positive) || 0,
      negative: Number(data.sentiment_breakdown.negative) || 0,
      neutral: Number(data.sentiment_breakdown.neutral) || 0
    };
    const total = raw.positive + raw.negative + raw.neutral;
    const pct = total > 0 ? {
      positive: (raw.positive / total) * 100,
      negative: (raw.negative / total) * 100,
      neutral: (raw.neutral / total) * 100
    } : { positive: 0, negative: 0, neutral: 0 };

    // Gauge Chart
    const ctx = document.getElementById("gaugeChart").getContext("2d");
    const gaugeNeedle = {
      id: "gaugeNeedle",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || !meta.data.length) return;

        const arc = meta.data[0];
        const cx = arc.x;
        const cy = arc.y;
        const start = -Math.PI;
        const end = 0;
        const value = Math.max(0, Math.min(pct.positive, 100));
        const angle = start + (value / 100) * (end - start);
        const r = arc.outerRadius;
        const L = r * 0.9;
        const nx = cx + L * Math.cos(angle);
        const ny = cy + L * Math.sin(angle);

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#333";
        ctx.fill();
        ctx.font = "bold 14px system-ui, Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#333";
        ctx.fillText(`${value.toFixed(0)}% Positive`, cx, cy + r * 0.65);
        ctx.restore();
      }
    };

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Negative", "Neutral", "Positive"],
        datasets: [{
          data: [pct.negative, pct.neutral, pct.positive],
          backgroundColor: [chartNegative, chartNeutral, chartPositive], 
          borderWidth: 0,
          hoverOffset: 0
        }]
      },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        animation: { animateRotate: true, animateScale: false }
      },
      plugins: [gaugeNeedle]
    });


    // Donut Chart
    const donutCtx = document.getElementById("sentimentDonut").getContext("2d");
    new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [{
          data: [pct.positive, pct.negative, pct.neutral],
          backgroundColor: [chartPositive, chartNegative, chartNeutral],
          borderWidth: 0
        }]
      },
     options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  cutout: "65%",
  layout: {
    padding: 10
  }
}

    });

    // Update percentages
    document.getElementById("posPct").textContent = `${pct.positive.toFixed(0)}%`;
    document.getElementById("negPct").textContent = `${pct.negative.toFixed(0)}%`;
    document.getElementById("neuPct").textContent = `${pct.neutral.toFixed(0)}%`;

    // Wordcloud
    document.getElementById("wordcloudImg").src = data.wordcloud_file;

    // Customer Loves
const lovesList = document.getElementById("lovesList");
lovesList.innerHTML = "";
if (data.customer_descriptions && data.customer_descriptions.length > 0) {
  // Calculate total count
  const totalCount = data.customer_descriptions.reduce((sum, item) => sum + item.percent, 0);

  data.customer_descriptions.forEach(item => {
    const normalized = totalCount > 0 ? ((item.percent / totalCount) * 100).toFixed(0) : 0;
    lovesList.insertAdjacentHTML(
      "beforeend",
      `<li><span>${item.label}</span><span style="font-weight:600;">${normalized}%</span></li>`
    );
  });
}



    // Review Highlights
    const highlightsList = document.getElementById("highlightsList");
    highlightsList.innerHTML = "";
    if (data.sample_reviews && data.sample_reviews.length > 0) {
      data.sample_reviews.forEach(review => {
        highlightsList.insertAdjacentHTML(
          "beforeend",
          `<li>“${review}”</li>`
        );
      });
    }

  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

loadDashboard();
