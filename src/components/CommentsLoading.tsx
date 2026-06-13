const CommentsLoading = () => {
  return (
    <section className="section" aria-label="Comments loading section">
      <div>
        <div className="flex items-center gap-2">
          <h2>Comments</h2>
          <span aria-live="polite">...</span>
        </div>
      </div>
      <div role="status" aria-label="Loading comments">
        Loading comments...
      </div>
    </section>
  );
};

export default CommentsLoading;
