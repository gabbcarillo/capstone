const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");
      const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (activeLink) {
        navLinks.forEach(l => l.classList.remove("active"));
        activeLink.classList.add("active");
      }
    }
  });
}, { 
  threshold: 0.6, // ← Increase from 0.5 to 0.6
  rootMargin: "-10% 0px -10% 0px" // ← Add margin to avoid edge triggers
});