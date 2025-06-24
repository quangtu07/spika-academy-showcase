import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Helper function to get base URL for course links
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:8080'; // fallback for SSR
};

interface BlogContent {
  id: string;
  title: string;
  content: string;
}

const blogContents: Record<string, BlogContent> = {
  '1': {
    id: '1',
    title: 'Phát triển kỹ năng mềm cho trẻ: Tầm quan trọng và cách thức phát triển',
    content: `
      <p>Kỹ năng mềm là những kỹ năng quan trọng giúp trẻ thành công trong học tập, công việc và cuộc sống. 
      Bên cạnh các kiến thức học tập, bố mẹ cần trang bị cho trẻ các kỹ năng mềm cần thiết ngay từ khi còn nhỏ. 
      Vậy có những kỹ năng mềm nào là cần thiết và cách phát triển kỹ năng mềm cho trẻ như thế nào? Mời bố mẹ khám phá câu trả lời trong bài viết dưới đây!</p>
      
      <img src="/images/blog/blog1/111.png" alt="skill1" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Kỹ năng mềm là gì?</h1>
      <img src="/images/blog/blog1/112.png" alt="skill2" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      <p>Kỹ năng mềm là những kỹ năng quan trọng giúp chúng ta hòa nhập với xã hội, thành công trong công việc và xây dựng mối quan hệ tốt đẹp với người khác. Một số kỹ năng mềm có thể kể đến như: làm việc nhóm, giao tiếp, quản lý thời gian, giải quyết vấn đề,…
      Kỹ năng cứng và kỹ năng mềm là hai khái niệm được sử dụng phổ biến trong lĩnh vực giáo dục và tuyển dụng. Kỹ năng cứng là những kỹ năng chuyên môn, kỹ thuật cần thiết để thực hiện một công việc cụ thể. Kỹ năng cứng có thể được học tập và rèn luyện thông qua các chương trình đào tạo, bồi dưỡng, hoặc qua quá trình làm việc thực tế. Kỹ năng mềm là những kỹ năng liên quan đến tính cách con người, không mang tính chuyên môn, không thể sờ nắm và có thể được phát triển thông qua quá trình rèn luyện, trải nghiệm.
      </p>

      <br>
      
      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Tầm quan trọng của kỹ năng mềm với trẻ</h1>
      <p>Kỹ năng mềm là chìa khóa giúp trẻ hòa nhập và khẳng định bản thân trong tập thể, cộng đồng và xã hội. Sở hữu những kỹ năng này giúp trẻ:</p>

      <br>

      <p>Hỗ trợ trẻ hòa nhập với xã hội: Khi sở hữu kỹ năng giao tiếp, làm việc nhóm, trẻ sẽ giao tiếp hiệu quả với người khác, xây dựng mối quan hệ tốt đẹp với bạn bè, thầy cô và gia đình. Từ đó trẻ sẽ nhanh chóng hòa nhập với xã hội, tự tin và tự lập hơn.
      Giúp trẻ thành công trong học tập: Kỹ năng giải quyết vấn đề, làm việc nhóm, quản lý thời gian,… giúp trẻ học tập hiệu quả hơn. Trẻ có thể tự giải quyết các vấn đề trong học tập, hợp tác tốt với bạn bè trong các dự án nhóm, quản lý thời gian học tập hợp lý,…
      </p>

      <br>

      <p>Phát triển sự nghiệp thành công: Kỹ năng mềm là một trong những yếu tố quan trọng quyết định sự thành công trong sự nghiệp. 
      Trẻ có kỹ năng mềm tốt sẽ có nhiều cơ hội thăng tiến trong công việc, được đánh giá cao bởi đồng nghiệp và cấp trên. </p>

      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Các kỹ năng mềm cần thiết cho trẻ</h1>
      
      <p>Trong bộ kỹ năng cần trang bị, dưới đây là những kỹ năng mềm cần thiết nhất:</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng tự phục vụ và bảo vệ bản thân</h2>
      <p>Bảo vệ và phục vụ bản thân là một trong những kỹ năng mềm quan trọng nhất đối với trẻ em, đặc biệt là lứa tuổi từ 6 đến 10 tuổi. Kỹ năng này giúp trẻ có nhận thức chính xác về bản thân, biết cách tự bảo vệ mình trước những nguy hiểm và biết cách tự chăm sóc. 
      Trẻ sẽ biết xử lý khi gặp người lạ, bảo vệ bản thân khi bị bắt cóc hoặc đi lạc, 
      hét thật to để cầu cứu khi cần thiết,…</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng quản lý cảm xúc</h2>
      <p>Không giống khi ở nhà được ông bà, bố mẹ nuông chiều, trẻ khi đến trường cần biết quản lý cảm xúc của bản thân. 
      Khi trẻ biết kiểm soát cảm xúc, trẻ sẽ tránh được những hành vi thiếu suy nghĩ như nổi giận, bốc đồng, hoặc làm tổn thương người khác. 
      Đồng thời, trẻ cũng sẽ biết quan tâm, cảm thông và chia sẻ với người khác nhiều hơn.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng quản lý thời gian</h2>
      <p>Có kỹ năng quản lý thời gian, trẻ sẽ biết cách trân trọng thời gian, sử dụng thời gian một cách hiệu quả, từ đó đạt được mục tiêu của bản thân. 
      Tuy nhiên, để có được kỹ năng này, trẻ cần phải trải qua một quá trình rèn luyện lâu dài. 
      Bởi lẽ, trẻ thường quen với sự sắp xếp của cha mẹ và chưa có khả năng hình dung kế hoạch trong tương lai.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng làm việc đội nhóm</h2>
      <p>Trong xã hội hội nhập và phát triển như hiện nay, kỹ năng làm việc nhóm  càng trở nên cần thiết hơn bao giờ hết. 
      Đây không chỉ đơn giản là việc trẻ "tồn tại" trong một tập thể, mà còn là khả năng phối hợp chặt chẽ với người khác để đạt được mục tiêu chung. 
      Cha mẹ và nhà trường cần tạo cơ hội cho trẻ tham gia các hoạt động tập thể, như: hoạt động ngoại khóa, câu lạc bộ, đội nhóm,… 
      để trẻ có cơ hội rèn luyện kỹ năng làm việc nhóm.</p>
      
      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng giao tiếp ứng xử</h2>
      <p>Từ 5 đến 10 tuổi, trẻ có sự phát triển vượt trội về ngôn ngữ. Đây là giai đoạn vàng để trẻ học hỏi và hình thành các kỹ năng giao tiếp và ứng xử. 
      Cha mẹ cần ưu tiên dạy trẻ những kỹ năng này ngay từ nhỏ để giúp trẻ phát triển toàn diện và có được những mối quan hệ tốt đẹp với mọi người xung quanh.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng tự nhận thức</h2>
      <p>Kỹ năng tự nhận thức là khả năng hiểu biết về bản thân, bao gồm nhận thức về cảm xúc, suy nghĩ, giá trị, sở thích, điểm mạnh, điểm yếu, v.v. 
      Nhờ có kỹ năng này, trẻ sẽ nhìn nhận bản thân một cách khách quan và chính xác hơn, 
      xác định được mục tiêu và định hướng nghề nghiệp của bản thân thay vì bị ảnh hưởng bởi những định kiến hay kỳ vọng của người khác. 
      Không chỉ vậy, khi hiểu rõ bản thân, trẻ sẽ biết cách ứng xử phù hợp và tôn trọng người khác.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng giải quyết vấn đề</h2>
      <p>Kỹ năng giải quyết vấn đề là một trong những kỹ năng mềm quan trọng nhất mà trẻ em cần được trang bị. 
      Kỹ năng này giúp trẻ có khả năng nhận biết và giải quyết các vấn đề một cách hiệu quả, 
      từ đó phát triển tư duy, khả năng sáng tạo và tự tin.</p>

      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Các hoạt động phát triển kỹ năng mềm cho trẻ</h1>
      
             <p>Bố mẹ có thể rèn luyện kỹ năng mềm cho trẻ thông qua các hoạt động hàng ngày như:</p>
       <br>
       <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.8;">
         <li style="margin-bottom: 12px;">
           <strong>Cho trẻ chơi trò chơi:</strong> Trò chơi là một cách tuyệt vời để trẻ học hỏi và phát triển các kỹ năng mềm. 
           Bố mẹ và thầy cô có thể khuyến khích trẻ tham gia các trò chơi như đóng vai, kể chuyện, giải đố,…
         </li>
         <li style="margin-bottom: 12px;">
           <strong>Hoạt động ngoại khóa:</strong> Tham gia hoạt động ngoại khóa giúp trẻ giao tiếp, kết nối với mọi người và phát triển các kỹ năng mềm.
           Các hoạt động ngoại khóa trẻ có thể tham gia như chơi thể thao, vẽ tranh, tình nguyện,…
         </li>
         <li style="margin-bottom: 12px;">
           <strong>Môi trường gia đình:</strong> Bố mẹ là những người ảnh hưởng lớn nhất đến sự phát triển của trẻ. 
           Bố mẹ nên tạo ra một môi trường gia đình tích cực, khuyến khích trẻ giao tiếp, chia sẻ và thể hiện bản thân.
         </li>
       </ul>
       <img src="/images/blog/blog1/113.jpg" alt="skill3" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

       <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Khóa học phát triển kỹ năng mềm cho trẻ tại Future Wings</h1>

       <p>Trong thời đại mới, trẻ em cần được trang bị đầy đủ kỹ năng sống và kiến thức để tồn tại và phát triển. Kỹ năng sống giúp trẻ tự tin, 
       chủ động và có khả năng ứng phó với những thay đổi của xã hội. Kiến thức giúp trẻ hiểu biết về thế giới xung quanh và có nền tảng vững chắc để học tập, 
       làm việc và phát triển bản thân. <p>

       <br>

       <p>Bên cạnh sự đồng hành của bố mẹ, trẻ cần được rèn luyện trong một môi trường học tập tốt nhất với sự trợ giúp của những người có chuyên môn. 
       Môi trường học tập tốt sẽ giúp trẻ phát triển toàn diện cả về thể chất, trí tuệ và tinh thần. </p>

       <br>

       <p>Tại các khóa học của Future Wings, các em học sinh sẽ được trang bị bộ kỹ năng mềm gắn liền với học tập. Bộ kỹ năng này bao gồm các kỹ năng quan trọng như giao tiếp, thuyết trình, 
       làm việc nhóm thông qua các khóa học Đọc, Viết, Kể chuyện, 
       giúp học sinh phát triển toàn diện cả về tư duy, kỹ năng và thái độ.</p>

       <br>

       <p>Hiện nay Future Wings đang có 2 khóa học được tổ chức hàng tháng giúp các bạn nhỏ rèn luyện kỹ
        năng nói , tự tin trước đám đông cũng như mong muốn trở thành MC nhí chuyên nghiệp:</p>
       <p>
         <a 
           href="#"
           style="color: #02458b; text-decoration: underline; font-weight: bold; cursor: pointer;"
           onclick="event.preventDefault(); window.open(window.location.origin + '/course/b2e3f51a-9bdb-41b3-be2b-6329d9f2b8ae', '_blank');"
         >
           Khóa học 1: Học MC nhí cơ bản
         </a>
       </p>

       <br>

       <p>Hy vọng rằng thông qua bài viết này, bố mẹ đã có cái nhìn rõ ràng hơn về cách phát triển kỹ năng mềm cho trẻ. 
       Nếu cần hỗ trợ thêm, bố mẹ hãy liên hệ tới 
       hotline của Future Wings: <b>0853326829</b> để nhận tư vấn nhanh chóng nhé!</p>

    `
  },
  '2': {
    id: '2',
    title: 'Muốn chữa ngọng cho trẻ, phải làm sao?',
    content: `
      <p>Bạn có nhận thấy con mình phát âm sai một số âm như "l" – "n", "s" – "x",
       hay nói líu lưỡi khiến người khác khó hiểu? Đó có thể là dấu hiệu trẻ đang gặp vấn đề về phát âm – nói ngọng,
       nếu không được can thiệp kịp thời sẽ ảnh hưởng đến giao tiếp, sự tự tin và khả năng học tập sau này.</p>

      <br>

      <p>Nhiều bậc phụ huynh lo lắng nhưng không biết bắt đầu từ đâu, nên tìm chuyên gia hay luyện tại nhà, và liệu nói ngọng có tự hết theo thời gian?
       Bài viết dưới đây sẽ giúp bạn hiểu rõ nguyên nhân, dấu hiệu và cách chữa ngọng hiệu quả cho trẻ một cách khoa học và nhẹ nhàng nhất. </p>
      
      <img src="/images/blog/2.png" alt="React development" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Nói ngọng ở trẻ có nguy hiểm?</h1>
      <p><b>Nói ngọng </b> là rối loạn phát âm lời hay trẻ nói không rõ từ, thường xảy ra ở hầu hết trẻ, 
      nhất là trong giai đoạn lúc bắt đầu tập nói. Theo thời gian tăng trưởng, 
      các cấu trúc phát âm như hàm, môi, lưỡi, răng, lưỡi gà… phát triển thì lời nói của trẻ sẽ rõ hơn; 
      các âm nói rõ hơn cũng tùy theo các giai đoạn phát triển của trẻ, ví dụ âm m, 
      b trẻ phát âm đúng từ khi còn nhỏ, còn âm r, s, tr sẽ nói rõ khi trẻ lớn hơn. 
      Tuy nhiên, có một số trẻ sẽ không tự khỏi và điều này ảnh hưởng rất nhiều đến trẻ trong quá trình giao tiếp, 
      ảnh hưởng đến tâm lý của trẻ. </p>
      <br>

      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Nguyên nhân nói ngọng ở trẻ</h1>
      <p>Thông hường, có 2 dạng nói ngọng phổ biến nhất ở trẻ em là <b>nói ngọng sinh lý</b> ( là dạng nói ngọng bẩm  sinh do cơ quan phát âm có vấn đề)
       và <b>nói ngọng do tính chất xã hội</b> ( do quá trình tập nói phát âm lệch chuẩn)</p>

      <br>
       <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Biện pháp khắc phục tình trạng nói ngọng</h1>
      <p>Nếu dưới 6 tuổi, trẻ nói ngọng cũng là điều bình thường và dưới độ tuổi này cho con theo học các lớp chữa ngọng, 
      vẫn có thể khắc phục được. Nhưng nếu sau 6 tuổi, trẻ vẫn nói ngọng có lẽ cơ quan phát âm của trẻ đang gặp vấn đề, 
      trong trường hợp này, cha mẹ cần đưa con đến bác sĩ kiểm tra các cấu trúc phát âm 
      và các âm trẻ nói sai để hướng dẫn trẻ cách đặt vị trí đúng của cơ quan phát âm, 
      cách nhận ra âm nào đúng âm nào sai, cách sử dụng đúng các quy luật phát âm để trẻ nói rõ ràng và dễ hiểu.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Một số phương pháp chữa nói ngọng cho trẻ</h1>
             <p>Ngay từ khi còn nhỏ, bố mẹ cần phải chú ý cho con hình thành những thói quen sau:</p>
       
       <br>
       <ol style="margin-left: 20px; line-height: 1.8; counter-reset: item;">
         <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
           <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">1</span>
           Luyện cơ hàm cho con ngay khi con nhỏ như ăn các loại thức phẩm có lợi để con có cơ hàm khỏe mạnh, linh hoạt.
         </li>
                    <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">2</span>
             Tập cơ má và lưỡi, hướng dẫn con sức miệng làm một vật (có thể là viên kẹo) từ má này sang má khác trong miệng để có cơ má và lưỡi mềm.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">3</span>
             Phòng tránh mắc các bệnh ngạt mũi, khó thở vì phải thở bằng miệng. Khi trẻ bị bệnh cần điều trị để con thở tự nhiên bằng cả miệng và mũi.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">4</span>
             Cha mẹ không cố tình phát âm sai theo con, làm trẻ nghĩ nói như thế sẽ hay hơn.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">5</span>
             Giúp con thoải mái nhất khi giao tiếp, không nói nhiều, hối dốn khiến con lúng túng dẫn đến nói lắp, nói ngọng.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">6</span>
             Thường xuyên nói chuyện, hát, đọc sách cho con nghe, đừng để ngữ thất chuẩn để con có thể bắt chước theo.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">7</span>
             Cho con tiếp xúc với môi trường bên ngoài để tăng cường hoạt động giao tiếp, trẻ sẽ có cơ hội để học hỏi cách nói của người khác.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">8</span>
             Hạn chế cho con tiếp xúc với những người nói ngọng, khi con nói ngọng thì tuyệt đối không mại lại sẽ làm con không phân biệt được đúng sai.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">9</span>
           Khi chữa lại nói ngọng cho con, các bậc phụ huynh cần sự kiên trì bởi đây là công việc không thể thành công trong ngày một ngày hai, khi phát hiện con nói ngọng, phải chỉ ra và bắt con sửa ngay lập tức. Nếu nghĩ ngờ con bị nói ngọng do yếu tố sinh lý như ngắn lưỡi, dài lưỡi, tệ ở lưỡi, ở có hỏng... thì cần đưa con đi khám để kịp thời khắc phục.
         </li>
       </ol>
 
      `
  },
  '3': {
    id: '3',
    title: '5 yếu tố quan trọng trong việc luyện giọng nói cho trẻ',
    content: `
      <p>Giọng nói là 'công cụ' mà chúng ta sử dụng mỗi ngày, đó cũng chính là 'vũ khi lợi hại' giúp chinh phục người đối diện.</p>
      
      <br>
      <p>Không chỉ những MC – người dẫn chương trình, nhà diễn thuyết, giáo viên …mới cần có 1 giọng nói hay, mỗi người chúng ta, 
      dù làm công việc gì, độc tuổi nào cũng cần rèn luyện giọng nói, 
      trau dồi tư duy ngôn ngữ bởi đó là những yếu tố quan trọng giúp bạn gây ấn tượng và tạo được dấu ấn riêng của bản thân, 
      mỗi khi xuất hiện trước đám đông. Những điều này cần được rèn luyện ngay từ khi còn nhỏ</p>

      <img src="/images/blog/3.jpg" alt="React development" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <p style="font-size: 20px; font-weight: bold; color: #1f2937;">Vậy làm thế nào để trẻ có được giọng nói hay ngay từ khi còn nhỏ? Hãy cùng tìm hiểu ngay sau đây:</p>

      <br>

      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">1. Phát âm chuẩn</h1>

      <p>Hầu hết trẻ nhỏ đều gặp những lỗi cơ bản trong phát âm, 
      nhiều phụ huynh chủ quan cho rằng "Kệ đi, lớn lên tự khắc phát âm chuẩn" 
      hoặc còn nói ngọng theo con để dỗ dành trẻ, nhưng họ đã nhầm, 
      chính những điều tưởng chừng như đơn giản đó lại khiến trẻ hình thành thói quen phát âm "thiếu chuẩn".</p>

      <br>
      
      <p style="font-weight: bold; color: #1f2937; margin-bottom: 10px;">Những trường hợp phát âm "thiếu chuẩn" thường gặp ở trẻ:</p>
      
      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 8px; flex-shrink: 0;"></span>
          <span>Nhầm lẫn giữa: l/n, s/x, ch/tr, d/r, ... Đặc biệt là khi đọc tên các địa danh, tên riêng...</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 8px; flex-shrink: 0;"></span>
          <span>Dấu: hỏi, ngã, nặng</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 8px; flex-shrink: 0;"></span>
          <span>Phát âm nuốt từ, không trọn vẹn, rõ chữ.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 8px; flex-shrink: 0;"></span>
          <span>Phát âm sai: "anh" thành "ăn", "inh" thành "un", "iều" thành "iu", ...</span>
        </li>
      </ul>

      <p style="font-weight: bold; color: #1f2937;">Cách khắc phục:</p>

      <p>Phụ huynh cần dành thời gian nói chuyện và lắng nghe con mỗi ngày, 
      nếu phát hiện con phát âm chưa đúng phải lập tức sửa ngay, 
      bằng những lời nhắc nhở nhẹ nhàng, 
      và phân tích cụ thể cho trẻ hiểu (với những bạn đã nhận thức được mặt chữ). 
      Ngoài ra, nên ghi âm lại những cuộc hội thoại của trẻ, hoặc ghi âm trẻ đọc bài thơ, 
      đoạn văn nào đó… sau đó chỉ ra lỗi phát âm và nhắc nhở con sửa lại cho đúng.</p>
      
      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">2. Lấy hơi từ bụng</h1>
      <p>Để trẻ có giọng nói to, cột hơi khỏe cần phải luyện tập hằng ngày. 
      Cho trẻ hít vào bằng cả mũi và miệng, sao cho lượng hơi đó dồn xuống bụng, 
      khiến bụng phình ra, giữ nguyên 5 giây, sau đó thở ra nhẹ nhàng. 
      Lặp lại động tác này 5-10 lần mỗi ngày.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">3. Âm lượng và tốc độ</h1>
      <p>Nói to hay nói nhỏ sẽ hay hơn? Nói nhanh hay nói chậm sẽ thu hút hơn? </p>
      <p> Sẽ khó có đáp án nào chính xác dành cho câu hỏi này, bởi âm lượng và
       tốc độ nói còn phải phụ thuộc vào từng không gian, vị trí, hoàn cảnh khác nhau…
       Phụ huynh nên duy trì cho trẻ 1 tốc độ và âm lượng nói vừa phải.
      Ví dụ: Khi đọc thơ cần chậm rãi, nhẹ nhàng. Khi đọc bài phát biểu cần mạnh mẽ, hùng hồn…
      </p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">4. Nói truyền cảm</h1>
      <p>Hãy tập cho trẻ cách truyền cảm xúc vào giọng nói như sau: với 1 câu chuyện buồn, 
      nên nói với giọng trầm và chậm rãi, cò những câu chuyện vui hoặc những lời kêu gọi, 
      hãy hướng dân trẻ nói lớn và cao giọng hơn. </p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">5. Tạo ngữ điệu khi nói</h1>
      <p>Nói có ngữ điệu là điều không hề dễ dàng với cả người lớn và trẻ nhỏ. 
      Có rất nhiều phương pháp giúp giọng nói thu hút hơn nhờ ngữ điệu, 
      thế nhưng các đơn giản nhất hãy bắt đầu từng câu một. 
      Những từ đầu tiên trong câu cần nói với âm lượng to và nhỏ dần ở những từ cuối câu. 
      Nếu trong câu có những con số, tên riêng… cần nhấn mạnh vào những thông tin đó để tạo sự thu hút. </p>
      <p>Hiện nay Future Wings đang có 2 khóa học được tổ chức hàng tháng giúp các bạn nhỏ rèn luyện kỹ
       năng nói , tự tin trước đám đông cũng như mong muốn trở thành MC nhí chuyên nghiệp:</p>
              <p>
          <a 
            href="#"
            style="color: #02458b; text-decoration: underline; font-weight: bold; cursor: pointer;"
            onclick="event.preventDefault(); window.open(window.location.origin + '/course/b2e3f51a-9bdb-41b3-be2b-6329d9f2b8ae', '_blank');"
          >
            Khóa học MC nhí
          </a>
        </p>
                <p>
          <a 
            href="#"
            style="color: #02458b; text-decoration: underline; font-weight: bold; cursor: pointer;"
            onclick="event.preventDefault(); window.open(window.location.origin + '/course/87157e32-935e-4fff-818d-ea6767944dcd', '_blank');"
          >
            Khóa học kỹ năng thuyết trình
          </a>
        </p>
    `,
  },
  '4': {
    id: '4',
    title: '7 Kỹ Năng Cần Thiết Cho Trẻ Ở Thế Kỷ 21 – Cha Mẹ Không Thể Bỏ Qua!',
    content: `
      <p><b>Trong kỷ nguyên công nghệ phát triển như vũ bão </b>, thế giới đang thay đổi từng ngày, 
      từng giờ. Những kiến thức hôm nay có thể không còn phù hợp vào ngày mai. 
      Vì vậy, việc <b>trang bị cho trẻ em những kỹ năng sống thiết yếu</b> là vô cùng quan trọng – giúp 
      con không chỉ theo kịp mà còn tự tin vươn lên trong tương lai.</p>

      <br>
      <p>Dưới đây là <b>7 kỹ năng “vàng” trong thế kỷ 21</b> mà cha mẹ nên sớm rèn luyện cho con:</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">1. Tư Duy Sáng Tạo – “Chìa khóa” mở ra thế giới</h1>

      <p>Sáng tạo không đơn thuần là vẽ tranh hay chơi nhạc. Đó là khả năng <b>nhìn mọi thứ theo một cách mới</b>, 
      tìm ra giải pháp độc đáo và không ngại thử - sai - học lại. </p>

      
      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cha mẹ có thể cho con tham gia các hoạt động thủ công, sáng tạo.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Đặt câu hỏi mở như: “Con nghĩ có cách nào khác không?”</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Tạo không gian tự do để con khám phá, không ép khuôn suy nghĩ.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">2. Giao Tiếp Hiệu Quả – Cầu nối giữa người với người</h1>
      <p>Giao tiếp không chỉ là “biết nói”, mà là <b>biết lắng nghe, biết chia sẻ đúng cách</b>, 
      biết diễn đạt cảm xúc và suy nghĩ của mình một cách rõ ràng, tích cực.</p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cha mẹ có thể cho con tham gia các hoạt động thủ công, sáng tạo.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Đặt câu hỏi mở như: “Con nghĩ có cách nào khác không?”</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Tạo không gian tự do để con khám phá, không ép khuôn suy nghĩ.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">3. Quản Lý Cảm Xúc – Hiểu mình, hiểu người</h1>
      <p>Trẻ em cũng có những cảm xúc phức tạp: tức giận, lo lắng, buồn bã... Nhưng <b>biết gọi tên và kiểm soát cảm xúc mới là điều quan trọng.</b></p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cha mẹ có thể dạy con nhận diện cảm xúc bằng hình ảnh, màu sắc.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Gợi ý cách giải tỏa như hít thở sâu, viết nhật ký, vẽ tranh.”</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Đồng hành cùng con trong những lúc cảm xúc dâng trào thay vì chỉ trích.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">4. Giải Quyết Vấn Đề – Nền tảng của sự trưởng thành</h1>
      <p>Từ việc mất đồ chơi, bất đồng với bạn, đến những bài toán hóc búa – <b>giải quyết vấn đề là kỹ năng sống còn</b> giúp trẻ chủ động hơn trong mọi tình huống.</p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Gợi ý cho cha mẹ là cho con tự tìm cách giải quyết trước khi “ra tay”.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Đặt câu hỏi gợi mở như: “Nếu con thử làm theo cách khác thì sao?”</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Động viên dù giải pháp chưa hoàn hảo.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">5. Làm Việc Nhóm – Không ai thành công một mình</h1>
      <p>Tương lai là thời đại của <b>kết nối và hợp tác</b>. Trẻ cần học cách phối hợp với người khác, lắng nghe ý kiến đa chiều và cùng nhau hoàn thành mục tiêu.</p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Khuyến khích con tham gia các hoạt động nhóm, CLB.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Tạo cơ hội cho con làm việc cùng anh/chị/em.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Dạy con chia sẻ trách nhiệm thay vì “độc chiếm” công việc.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">6. Quản Lý Thời Gian – Tự chủ trong học tập và cuộc sống</h1>
      <p>Biết cách sắp xếp thời gian là bước đầu để trẻ <b>chủ động hơn trong học tập, vui chơi và sinh hoạt hàng ngày.</b></p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cha mẹ có thể hướng dẫn con tạo lịch biểu bằng màu sắc vui nhộn.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Giúp con phân biệt giữa việc “quan trọng” và “khẩn cấp”.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cùng con tổng kết ngày hôm đó để rút kinh nghiệm.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">7. Tư Duy Phản Biện – Biết phân tích, chọn lọc và đưa ra chính kiến</h1>
      <p>Trong thế giới đầy thông tin như hiện nay, trẻ cần <b>khả năng đánh giá, phản biện, không dễ bị dẫn dắt.</b></p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Hãy rèn luyện cho con bằng cách khuyến khích con đặt câu hỏi ngược: “Tại sao lại như vậy?”.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Cho con đọc và so sánh nhiều nguồn thông tin.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Tập tranh luận lành mạnh trong gia đình với các chủ đề đơn giản.</span>
        </li>
      </ul>

      <br>
      <h1 style="font-size: 30px; font-weight: bold; color: #1f2937;">Future Wings – Nơi Ươm Mầm Kỹ Năng Thế Kỷ 21 Cho Trẻ</h1>
      <p>Tại Future Wings, chúng tôi hiểu rằng: <b>kiến thức có thể thay đổi, nhưng kỹ năng sống sẽ theo con suốt đời.</b> 
      Thông qua các chương trình đào tạo kỹ năng mềm chuyên biệt, các bé sẽ được <b>trau dồi những kỹ năng thiết yếu</b> 
      cho sự phát triển toàn diện – từ tư duy phản biện, giao tiếp, sáng tạo cho đến quản lý cảm xúc và thời gian. </p>
      <p>🎯 Hãy để con được học – chơi – lớn lên một cách toàn diện tại Future Wings! </p>
      <p>📞 Liên hệ với chúng tôi để tìm hiểu thêm về các khóa học kỹ năng phù hợp cho độ tuổi của con.</p>
    `,
  },
  '5': {
    id: '5',
    title: 'Lợi ích khi trẻ tham gia khóa học MC nhí từ sớm',
    content: `
      <p>Việc tham gia khóa học MC nhí từ sớm mang lại rất nhiều lợi ích cho trẻ. Điền hình là 5 điều sau.</p>
      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">1. Phát triển kỹ năng MC chuyên nghiệp</h1>
      <p>Rất nhiều bạn trẻ có kỹ năng MC từ bé nhưng không phải ai cũng biết cách biến chúng trở nên chuyên nghiệp. 
      Vì vậy, để các con tham gia khóa học MC nhí sẽ giúp phát huy tối đa khả năng của con.</p>
      <br>
      <p>Ngày nay, rất nhiều chương trình mời các bé dẫn MC. 
      Nếu bố mẹ đang quan tâm và mong muốn trau dồi kiến thức cho con tốt nhất 
      nên tìm đến các khóa học. Tại đây có các thầy cô, 
      giáo trình chuyên nghiệp, giúp con dễ dàng phát huy khả năng.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">2. Xây dựng tác phong chuẩn MC nhí</h1>

      <p>Các MC cần có tác phong và ngôn ngữ hình thể chuyên nghiệp. 
      Tuy nhiên, với các bé còn nhỏ chưa có đầy đủ kỹ năng, 
      ba mẹ nên trang bị cho con các kỹ năng tốt. 
      Việc này giúp con tự tin trở thành MC nhí, góp phần thúc đẩy các kỹ năng mềm khác.</p>

      <br>

      <p>Các MC nhí có tác phong nhanh nhẹn, ngôn ngữ hình thể linh hoạt, 
      giọng nói tốt sẽ có con đường sự nghiệp rộng mở. 
      Hiện Future Wings đang có các khóa học MC nhí từ sớm, ba mẹ có thể tham khảo.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">3. Học cách xử lý tình huống tốt hơn</h1>

      <p>Việc cho con tham gia các khóa học MC nhí từ sớm còn giúp con biết cách xử lý tình huống tốt hơn. 
      Điều này là rất quan trọng vì trong giao tiếp, cuộc sống luôn có các điều bất ngờ xảy ra. 
      Việc con được trang bị kiến thức tốt giúp xây dựng nền tảng tốt. </p>

      <br>
      <p>Các con có nhiều kinh nghiệm xử lý tình huống sẽ dễ dàng nâng cao kiến thức, 
      khả năng nhìn nhận vấn đề. Những điều này con sẽ được dạy kỹ năng khi 
      tham gia các khóa học MC nhí.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">4. Tăng sự tự tin trong giao tiếp</h1>

      <p>Việc cho trẻ tham gia khóa học MC nhí từ sớm giúp mở ra cánh cửa của sự thành công. 
      Đây là bước đầu giúp con dễ dàng trò chuyện, chia sẻ, kết nối với thế giới xung quanh. 
      Con sẽ có thêm nhiều mối quan hệ tốt, thỏa sức thể hiện bản thân.</p>

      <br>

      <p>Tham gia khóa học MC nhí còn giúp con xóa bỏ đi sự tự tin bên trong, khơi dậy sự tự tin. Con sẽ năng nổ, hoạt bát hơn, dám làm những điều con thích.
      Trang bị thêm nhiều kỹ năng sống</p>

      <br>
      <p>Trong các khóa học MC nhí, ngoài việc học trò chuyện, 
      giao tiếp, con sẽ được học thêm nhiều điều thú vị như:</p>

      <ul style="list-style-type: none; margin-left: 15px; line-height: 1.8;">
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Kỹ năng ứng xử.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Kỹ năng ứng biến.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Kỹ năng hoạt náo.</span>
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
          <span style="background: #000; width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 10px; flex-shrink: 0;"></span>
          <span>Kỹ năng xử lý tình huống.</span>
        </li>
      </ul>

      <br>
      <p>Việc học các kỹ năng này giúp con nhanh chóng tiếp cận mọi người tốt hơn. 
      Con đường thành công cũng trở nên rộng mở hơn với con trong tương lai.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">5. Xây dựng hình ảnh từ khi còn nhỏ</h1>

      <p>Rất nhiều ba mẹ cho con tham gia khóa học MC nhí từ sớm để xây dựng hình ảnh cho con tốt hơn. Thầy cô sẽ giúp con định hướng, tạo dựng hình ảnh. 
      Con sẽ nhận được cái nhìn thiện cảm từ mọi người, 
      có thể có nhiều công việc tốt trong tương lai.</p> 

      <br>
      <h1 style="font-size: 25px; font-weight: bold; color: #1f2937;">Khóa học MC nhí chất lượng tại Future Wings</h1>
      <p>Nếu ba mẹ đang quan tâm và muốn tìm hiểu các khóa học MC nhí chuyên nghiệp có thể liên hệ Future Wings. 
      Đây là trung tâm luyện giọng uy tín, đã đào tạo nhiều bạn nhỏ. 
      Tại đây, các con sẽ được tiếp cận với cách trở thành MC chuyên nghiệp. 
      Con được hướng dẫn bởi các MC nổi tiếng. </p>

      <br>
      <p>Sau khi kết thúc khóa học MC nhí, con sẽ trở nên tự tin hơn, 
      có thể dẫn các chương trình tốt. Đây sẽ là hành trang tuyệt vời giúp con 
      bước vào đường đời.</p>
    `,
  },
};

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const blog = id ? blogContents[id] : null;

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài viết!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Button>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">           
            <div className="p-8">
              
              <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#02458b' }}>
                {blog.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
                style={{
                  lineHeight: '1.8',
                }}
              />
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
