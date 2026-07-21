return (
  <>
    <LoadingScreen visible={loading || !imagesReady} />
    <ScrollToTop />
    <Navbar />

    <main style={{ flex: 1 }}>
      <Routes>
        ...
      </Routes>
    </main>

    <Footer />
    <CookieBanner />
  </>
);
