import Accomplishment from './Accomplishment';
import Header from './Header';
import ProfileIntro from './ProfileIntro';
import RecentWork from './RecentWork';
import Technologies from './Technologies';

function About() {
  return (
    // <Container className="container md-8">
    //   <Row>
       
    //     <Col xs={6} md={4}>
    //       <Image src={img_} roundedCircle />
         
    //     </Col>
       
    //   </Row>
    //   <div style={{ color: 'white', marginTop: '20px' }}>
    //     {personalData.name}

    //   </div>
    // </Container>
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      <Header />
      <main style={{ display: "grid", gap: "2rem", marginTop: "3rem" }}>
        <ProfileIntro />
        {/* <NowPlaying /> */}
        <RecentWork />
        <Accomplishment/>
        <Technologies />
      </main>
    </div>
  );
};

export default About;
