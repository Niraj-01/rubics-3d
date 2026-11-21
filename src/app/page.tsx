import Loader from '@/ui/Loader';
import Stage from '@/ui/Stage';
import Brand from '@/ui/Brand';
import ScrollPanels from '@/ui/ScrollPanels';
import WeatherControl from '@/ui/WeatherControl';
import FloorPicker from '@/ui/FloorPicker';
import AmenityControl from '@/ui/AmenityControl';
import ContentLayer from '@/ui/ContentLayer';
import Projects from '@/ui/sections/Projects';
import Team from '@/ui/sections/Team';
import About from '@/ui/sections/About';
import Media from '@/ui/sections/Media';
import Enquiry from '@/ui/sections/Enquiry';
import Footer from '@/ui/sections/Footer';

export default function Home() {
  return (
    <>
      <Loader />
      <Stage />
      <Brand />
      <ScrollPanels />
      <AmenityControl />
      <WeatherControl />
      <FloorPicker />
      <ContentLayer>
        {/* the camera journey: scroll here drives the camera path */}
        <div id="journey" className="h-[800vh]" aria-hidden />
        <Projects />
        <Team />
        <About />
        <Media />
        <Enquiry />
        <Footer />
      </ContentLayer>
    </>
  );
}
