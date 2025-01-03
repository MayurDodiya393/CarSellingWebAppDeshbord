import "../UserStyleSheet/About.css";
import Header from "./Header";

function About() {
  return (
    <>
    <Header/>
    <div className="about-container">
      <h1 className="about-title">About Our Website</h1>
      <p className="about-description">
        Welcome to our Car Selling Application! This platform is designed to streamline the buying and selling of cars 
        with the power of modern web technologies.
      </p>
      <section className="about-details">
        <h2>Technology Stack</h2>
        <ul>
          <li>
            <strong>Frontend:</strong> Built with <strong>React.js</strong>, providing a dynamic and responsive user 
            interface for seamless interaction.
          </li>
          <li>
            <strong>Backend:</strong> Powered by <strong>Django</strong> and <strong>Django REST Framework</strong> 
            for robust and scalable API development.
          </li>
          <li>
            <strong>Authentication:</strong> Secured using <strong>JWT Tokens</strong> to ensure safe and authorized 
            access for users.
          </li>
          <li>
            <strong>Database:</strong> Integrated with a reliable database for efficient data storage and retrieval.
          </li>
        </ul>
      </section>

      <section className="about-features">
        <h2>Key Features</h2>
        <ul>
          <li>
            User authentication using JWT for secure login and token refresh functionality.
          </li>
          <li>
            Comprehensive car management including adding, updating, deleting, and searching cars.
          </li>
          <li>
            Mobile-responsive design using modern CSS techniques for optimal usability.
          </li>
          <li>
            Easy-to-use invoice generation for buyers and sellers.
          </li>
          <li>
            Pagination and search functionalities for a user-friendly experience.
          </li>
        </ul>
      </section>

      <section className="about-team">
        <h2>About Our Team</h2>
        <p>
          Our team is dedicated to delivering high-quality solutions by leveraging the latest web development 
          technologies. We take pride in providing a seamless and secure platform for our users.
        </p>
      </section>

      <footer className="about-footer">
        <p>Thank you for visiting our platform! We are currently under construction and are working hard to bring you new features. Stay tuned for more updates coming soon!</p>
      </footer>
    </div>
    </>
  );
}

export default About;


