#!/usr/bin/env node
'use strict';
// evals/e05/build.js -- author 43 synthetic follow-up nodes for the E05 registry
// (Newton's laws), write node.json for each, write plants.json, and build the four
// per-module registry files + index.json for all 50 nodes. Follow-up node.json is
// written with content_sha256 unset; tools/stamp.js fills hash/times/provenance.
// Run: node evals/e05/build.js   (from repo root)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'course');
const NODES = path.join(ROOT, 'nodes');
const REG = path.join(ROOT, 'registry');

// node(parent, slug, title, cq, intent, concepts, s1h, s1b, s2h, s2b, kp[], seeds[], bridge, kp?)
function mk(parent, slug, title, cq, intent, concepts, s1h, s1b, s2h, s2b, kp, seeds, bridge) {
  const id = parent + '/' + slug;
  return {
    id, parent, slug,
    node: {
      schema: 'metadax.node/0.2',
      id,
      parent_id: parent,
      kind: 'followup',
      depth: 1 + id.split('/').length - 1,
      anchor: null,
      title,
      question: '',
      canonical_question: cq,
      intent,
      summary: [s1b.split('. ')[0] + '.', s2b.split('. ')[0] + '.'],
      concepts,
      new_concepts: [],
      bloom_level: 'Understand',
      scope: 'in_scope',
      reuse: { decision: 'new', of: null, confidence: 0, rationale: 'Authored fixture node for the E05 registry.' },
      links: [],
      core: {
        sections: [
          { id: 's1', heading: s1h, body_md: s1b },
          { id: 's2', heading: s2h, body_md: s2b },
        ],
        key_points: kp,
        bridge_to_parent: bridge,
        bridge_to_objective: '',
        source_refs: [],
      },
      seeds,
      path: [{ id: parent, summary: 'Parent objective node.' }],
      created_by: 'author-e05',
      visibility: 'shared',
      superseded_by: null,
    },
  };
}

const F = [];

// ===== DUPLICATE GROUPS (20 nodes) =====
// D1 triple: adding two forces in different directions
F.push(mk('L01.M01.O01', 'adding-forces-different-directions', 'Adding forces that point in different directions',
  'How do you add two forces that point in different directions to get the net force?', 'deepen', ['net-force'],
  'Forces are vectors', 'Every force has a size and a direction, so two forces pointing different ways cannot simply be added as plain numbers. You place them tip to tail and the single arrow from the first tail to the last tip is their sum. That sum is the net force, and its direction can differ from either original force.',
  'The parallelogram shortcut', 'For two forces from the same point you can draw a parallelogram with the forces as sides; the diagonal is the net force. If the two forces are at right angles you can use the Pythagorean theorem for the size and the tangent for the angle. Either way you keep direction, not just magnitude.',
  ['Forces add as vectors, tip to tail, not as plain numbers.', 'The diagonal of the parallelogram is the net force.', 'Right-angle forces combine by Pythagoras.'],
  ['What if there are three forces instead of two?', 'How do I split one force into components?'],
  'This shows the mechanics behind the net force the objective defines.'));
F.push(mk('L01.M01.O01', 'vector-sum-of-two-forces', 'Finding the vector sum of two forces',
  'How do you find the vector sum of two forces acting at an angle?', 'deepen', ['net-force'],
  'Why plain addition fails', 'Two forces pulling in different directions do not combine to their arithmetic total, because direction matters as much as size. The correct combination is the vector sum: lay the arrows head to tail and read off the single arrow that closes the path. That resulting arrow is what actually acts on the body.',
  'Doing it with components', 'A reliable method is to break each force into horizontal and vertical parts, add the horizontal parts and the vertical parts separately, then recombine. The recombined horizontal and vertical totals give the size and direction of the vector sum. Components turn a geometry problem into simple arithmetic.',
  ['Direction matters, so forces need vector addition.', 'Head-to-tail drawing gives the resultant.', 'Adding components is the reliable numerical method.'],
  ['How do I resolve a force into components?', 'What angle does the resultant make?'],
  'It expands the vector meaning of net force from the objective.'));
F.push(mk('L01.M01.O01', 'combine-forces-with-vectors', 'Combining forces using vectors',
  'How do you combine several forces into one using vector methods?', 'deepen', ['net-force'],
  'One arrow instead of many', 'When many pushes and pulls act at once, physics replaces them with a single equivalent force: their vector sum. You chain the force arrows head to tail in any order and the closing arrow is the combined force. Only that combined force decides how the motion changes.',
  'Keeping track of direction', 'Because each force carries a direction, opposite forces subtract and perpendicular ones build a right-angled triangle. Working in x and y components lets you add long lists of forces without drawing. The final x and y totals rebuild the one net force.',
  ['Many forces reduce to one vector sum.', 'Order of head-to-tail addition does not matter.', 'Components handle any number of forces.'],
  ['Can the combined force be zero?', 'How does this connect to equilibrium?'],
  'It generalises the objective’s net force to many forces at once.'));

// D2 triple: mass vs weight
F.push(mk('L02.M01.O01', 'mass-versus-weight', 'Mass versus weight',
  'What is the difference between mass and weight?', 'clarify', ['mass'],
  'Two different quantities', 'Mass measures how much matter is in a body and how strongly it resists acceleration; it is the same everywhere. Weight is the gravitational force pulling on that mass, so it changes with location. On the Moon your mass is unchanged but your weight is about a sixth of its Earth value.',
  'Units give it away', 'Mass is measured in kilograms, a measure of inertia, while weight is a force measured in newtons. Weight equals mass times the local gravitational field strength, so w = mg. Confusing the two is why people wrongly think objects "lose mass" in space.',
  ['Mass is amount of matter and inertia, in kilograms.', 'Weight is a gravitational force, in newtons.', 'w = mg links them through local gravity.'],
  ['Why do I feel weightless in free fall?', 'How is g different on other planets?'],
  'It sharpens the meaning of mass used in F = ma.'));
F.push(mk('L02.M01.O01', 'how-mass-and-weight-differ', 'How mass and weight differ',
  'How do mass and weight differ, and why does it matter?', 'clarify', ['mass'],
  'Same object, two numbers', 'Ask two questions about any object: how much stuff is in it, and how hard gravity pulls on it. The first answer is its mass and never changes; the second is its weight and depends on where it is. A brick has the same mass in orbit but essentially no weight.',
  'Why the distinction matters', 'F = ma uses mass, not weight, because inertia is what resists acceleration. Using weight in place of mass gives wrong accelerations away from Earth’s surface. Keeping them separate keeps your force calculations correct anywhere.',
  ['Mass is fixed; weight varies with gravity.', 'F = ma needs mass, not weight.', 'Mixing them breaks calculations off Earth.'],
  ['What is my weight on Mars?', 'Does a balance measure mass or weight?'],
  'It underlines why mass, not weight, appears in the second law.'));
F.push(mk('L02.M01.O01', 'distinguishing-mass-from-weight', 'Distinguishing mass from weight',
  'How can you tell mass and weight apart in a problem?', 'clarify', ['mass'],
  'Read the units and the setting', 'If a value is in kilograms it is a mass; if it is in newtons it is a force, usually weight. A scale that reads kilograms is really inferring mass from weight assuming Earth gravity. In a moving lift that assumption fails and the reading drifts.',
  'A test you can apply', 'Ask whether the quantity would change on the Moon: mass would not, weight would. That single test separates them in almost any problem. Once separated, put mass into F = ma and treat weight as one of the forces.',
  ['Kilograms mean mass; newtons mean force.', 'Bathroom scales infer mass from weight.', 'The "would it change on the Moon" test separates them.'],
  ['Why does a lift change my apparent weight?', 'How do astronauts measure mass in orbit?'],
  'It gives a practical rule for using mass correctly in F = ma.'));

// D3 pair: seatbelt and inertia
F.push(mk('L01.M01.O01', 'seatbelt-and-inertia', 'Seatbelts and inertia',
  'Why does a seatbelt protect you when a car stops suddenly?', 'example', ['inertia'],
  'Your body keeps going', 'When a car brakes hard, the car slows but your body, by inertia, tends to keep moving forward at the old speed. Without a restraint you would continue until something stops you, often the windscreen. Inertia, not a mysterious forward force, is what throws you.',
  'What the belt does', 'The seatbelt supplies the backward force that decelerates you along with the car. By spreading that force over your chest and hips and over a longer time, it reduces the peak force on your body. That is why belts prevent the sudden, concentrated impact.',
  ['Inertia keeps you moving when the car stops.', 'The belt provides the force that slows you.', 'Spreading the force over time lowers injury.'],
  ['How do airbags add to this?', 'Why does stopping over a longer time help?'],
  'It is a concrete case of the inertia the objective introduces.'));
F.push(mk('L01.M01.O01', 'why-seatbelts-work', 'Why seatbelts work',
  'How does inertia explain why seatbelts keep passengers safe?', 'example', ['inertia'],
  'The passenger’s point of view', 'A passenger moving with the car shares its velocity. When the car decelerates rapidly, nothing has yet acted on the passenger, so inertia carries them forward relative to the slowing car. The apparent lurch forward is simply continued motion.',
  'Turning a fast stop into a gentle one', 'A seatbelt couples the passenger to the car so both decelerate together. Because force equals the rate of change of momentum, extending the stopping time reduces the force felt. The belt thus converts a violent stop into a survivable one.',
  ['Passengers share the car’s velocity until a force acts.', 'Inertia, not a push, causes the forward lurch.', 'Longer stopping time means smaller force.'],
  ['What is momentum, exactly?', 'Why do crumple zones help?'],
  'It reinforces inertia with the same everyday safety example.'));

// D4 pair: rearrange F=ma for acceleration
F.push(mk('L02.M01.O01', 'rearrange-fma-for-acceleration', 'Rearranging F = ma for acceleration',
  'How do you rearrange F = ma to find acceleration from force and mass?', 'apply', ['newtons-second-law'],
  'Isolating a', 'Newton’s second law says net force equals mass times acceleration. To find acceleration you divide both sides by the mass, giving a = F / m. So the acceleration is just the net force shared out over the mass.',
  'A quick example', 'A 2 kg cart pushed with a net force of 6 N accelerates at 6 / 2 = 3 metres per second squared. Double the force and the acceleration doubles; double the mass and it halves. The formula makes both trends obvious.',
  ['a = F / m follows from F = ma.', 'Acceleration scales with force and inversely with mass.', 'Always use the net force, not a single force.'],
  ['What if several forces act at once?', 'How do units work out to m/s^2?'],
  'It applies the objective’s F = ma to solve for acceleration.'));
F.push(mk('L02.M01.O01', 'solving-fma-for-a', 'Solving F = ma for the acceleration',
  'How do you solve F = ma when you want the acceleration?', 'apply', ['newtons-second-law'],
  'The algebra step', 'Start from F = ma and treat acceleration as the unknown. Dividing through by mass leaves a on its own: a equals F over m. It is one algebra step, but the physics is that mass resists the change the force is trying to make.',
  'Reading the result', 'If the net force is fixed, a heavier object gets a smaller acceleration, which is why loaded trucks pick up speed slowly. If the mass is fixed, more net force means proportionally more acceleration. The single ratio a = F / m captures both effects.',
  ['Divide F = ma by mass to get a = F / m.', 'Heavier objects accelerate less for the same force.', 'The net force is what goes in the numerator.'],
  ['Where does friction enter this?', 'How would I find the force instead?'],
  'It restates the objective’s law rearranged for acceleration.'));

// D5 pair: identify action-reaction pairs
F.push(mk('L02.M02.O01', 'identifying-action-reaction-pairs', 'Identifying action-reaction pairs',
  'How do you identify the action-reaction force pair in an interaction?', 'apply', ['newtons-third-law'],
  'Name both bodies', 'Every third-law pair involves two different bodies acting on each other. Write the force as "A pushes B" and its partner is always "B pushes A", equal in size and opposite in direction. If both forces act on the same body, they are not a third-law pair.',
  'A worked identification', 'When you push a wall, you (A) push the wall (B); the wall pushes back on you with an equal force. The pair is you-on-wall and wall-on-you, not the wall’s push versus your weight. Matching the two bodies is the whole trick.',
  ['A pair always links two different bodies.', 'Swap the roles: A-on-B pairs with B-on-A.', 'Two forces on one body are never a pair.'],
  ['Why don’t the paired forces cancel?', 'How does this explain walking?'],
  'It puts the objective’s pairing rule into practice.'));
F.push(mk('L02.M02.O01', 'spotting-third-law-pairs', 'Spotting third-law pairs',
  'How can you spot which two forces form a Newton third-law pair?', 'apply', ['newtons-third-law'],
  'The two-body test', 'To spot a third-law pair, find the two objects that touch or interact and describe the force each exerts on the other. The pair is those two forces: same magnitude, opposite direction, one on each body. Anything acting on just one object is disqualified.',
  'Collision example', 'In a collision between a bat and a ball, the bat exerts a force on the ball and the ball exerts an equal and opposite force on the bat. Those two forces are the pair even though the ball flies off and the bat barely moves. Different masses, same paired forces.',
  ['Pairs act on two different bodies.', 'Equal size, opposite direction, always.', 'Unequal motion does not mean unequal forces.'],
  ['If forces are equal, why do outcomes differ?', 'What about gravity between Earth and Moon?'],
  'It gives a second route to the objective’s pair identification.'));

// D6 pair: book on table balanced forces
F.push(mk('L01.M02.O01', 'book-on-table-balanced-forces', 'The book on the table: balanced forces',
  'Why does a book resting on a table not fall through even though gravity pulls it down?', 'example', ['net-force', 'newtons-first-law'],
  'Two forces, not one', 'Gravity pulls the book down, but the table pushes up with a normal force of exactly equal size. These two forces add to zero, so the net force is zero. With no net force the book stays at rest, in line with the first law.',
  'How the table "knows"', 'The table’s surface compresses very slightly under the book, like a stiff spring, and pushes back just hard enough to balance the weight. If you piled on more books, the support force would grow to match until the table failed. Support forces are responses, adjusting to whatever load sits on them.',
  ['Weight down is balanced by the normal force up.', 'Zero net force means the book stays at rest.', 'The normal force adjusts to match the load.'],
  ['What happens the instant the table breaks?', 'How big can the normal force get?'],
  'It illustrates the objective’s equilibrium condition concretely.'));
F.push(mk('L01.M02.O01', 'why-resting-objects-stay-put', 'Why resting objects stay put',
  'Why does an object sitting on a surface stay still if gravity acts on it?', 'example', ['net-force', 'newtons-first-law'],
  'Balance, not absence', 'A resting object is not free of forces; it has gravity and the surface’s support pulling and pushing in opposite directions. Because they are equal, they cancel, leaving no net force. The first law then guarantees it keeps its state of rest.',
  'The support adjusts itself', 'The surface supplies exactly the upward force needed to cancel gravity, no more and no less. Press down harder and it pushes back harder, up to its breaking point. This self-adjusting support is why most everyday objects simply sit still.',
  ['Resting objects have balanced, not zero, forces.', 'Equal and opposite forces give zero net force.', 'Support forces self-adjust to the load.'],
  ['When does the surface stop being able to support?', 'Is the normal force always vertical?'],
  'It repeats the equilibrium idea with a general resting object.'));

// D7 pair: acceleration vs velocity
F.push(mk('L01.M01.O02', 'acceleration-vs-velocity', 'Acceleration versus velocity',
  'How is acceleration different from velocity?', 'contrast', ['kinematic-quantities'],
  'Rate versus rate-of-change', 'Velocity tells you how fast and in what direction you are moving right now. Acceleration tells you how quickly that velocity is changing. You can move very fast with zero acceleration, or be momentarily at rest yet accelerating hard.',
  'Direction can differ', 'Acceleration need not point the same way as velocity: when you brake, velocity is forward but acceleration points backward. A car rounding a bend at steady speed still accelerates because its direction changes. So the two vectors are genuinely independent.',
  ['Velocity is motion now; acceleration is its rate of change.', 'High speed can mean zero acceleration.', 'Acceleration and velocity can point different ways.'],
  ['Can something at rest be accelerating?', 'How does turning count as acceleration?'],
  'It contrasts the two quantities the objective defines.'));
F.push(mk('L01.M01.O02', 'how-acceleration-differs-from-velocity', 'How acceleration differs from velocity',
  'What makes acceleration a different quantity from velocity?', 'contrast', ['kinematic-quantities'],
  'Different questions', 'Velocity answers "how is it moving?" while acceleration answers "how is that motion changing?". One is a snapshot, the other is about the change between snapshots. Because of that, their sizes and directions need not agree.',
  'Everyday illustration', 'A plane cruising at 900 km/h in a straight line has huge velocity but zero acceleration. A sprinter exploding off the blocks has small velocity at first but large acceleration. Comparing the two examples separates the ideas cleanly.',
  ['Velocity is a snapshot; acceleration is a change.', 'Cruising means velocity high, acceleration zero.', 'Launching means velocity low, acceleration high.'],
  ['Is deceleration just negative acceleration?', 'How is each one measured?'],
  'It draws the same contrast with different examples.'));

// D8 pair: do heavier objects fall faster
F.push(mk('L02.M01.O01', 'do-heavier-objects-fall-faster', 'Do heavier objects fall faster?',
  'Do heavier objects fall faster than lighter ones?', 'challenge', ['mass', 'newtons-second-law'],
  'The surprising answer', 'Ignoring air resistance, all objects fall with the same acceleration regardless of mass. A heavy stone and a light one dropped together hit the ground at the same time. The famous intuition that heavier means faster is simply wrong in a vacuum.',
  'Why mass cancels', 'A heavier object feels more gravitational force, but it also has more inertia to move, and the two effects cancel exactly. In F = ma the larger force is divided by the larger mass, leaving the same acceleration g. Air resistance, not weight, is what makes a feather lag behind.',
  ['Without air, all masses fall at the same rate.', 'More weight is offset by more inertia.', 'Air resistance, not mass, causes real differences.'],
  ['What changes once air resistance matters?', 'Why did this fool people for centuries?'],
  'It challenges a misconception tied to the objective’s use of mass.'));
F.push(mk('L02.M01.O01', 'falling-speed-and-weight', 'Falling speed and weight',
  'Does an object’s weight decide how fast it falls?', 'challenge', ['mass', 'newtons-second-law'],
  'Weight does not set the pace', 'It feels obvious that heavier things should drop faster, yet in the absence of air they do not. Drop a coin and a bowling ball in a vacuum tube and they land together. Weight sets the pulling force but not the acceleration.',
  'The cancelling explained', 'Doubling the weight doubles the mass too, and acceleration is force divided by mass, so the ratio stays at g. Only when air resistance depends on shape and speed do real falls differ. That is why a parachute, not extra weight, changes a fall.',
  ['Weight does not determine fall acceleration.', 'Force and mass both double, so a stays g.', 'Shape-dependent air drag causes real differences.'],
  ['How does a parachute change the balance?', 'What is terminal velocity?'],
  'It restates the same misconception check about weight.'));

// D9 pair: what makes a frame inertial
F.push(mk('L01.M02.O02', 'what-makes-a-frame-inertial', 'What makes a frame inertial',
  'What actually makes a reference frame inertial?', 'clarify', ['inertial-frame'],
  'The defining test', 'A reference frame is inertial if an object with no net force on it moves in a straight line at constant velocity when viewed from that frame. In other words, the first law holds without any extra invented forces. Frames that pass this test are the ones Newton’s laws are stated for.',
  'Passing and failing', 'A lab bench at rest on the ground is very nearly inertial for everyday purposes. A frame fixed to an accelerating train is not, because a free puck would appear to slide without any real push. Acceleration of the frame itself is what breaks the property.',
  ['Inertial frames make free objects move at constant velocity.', 'The first law holds with no invented forces.', 'Accelerating frames fail the test.'],
  ['What forces appear in a non-inertial frame?', 'Is Earth truly inertial?'],
  'It clarifies the objective’s definition of an inertial frame.'));
F.push(mk('L01.M02.O02', 'recognizing-inertial-frames', 'Recognizing inertial frames',
  'How can you recognize whether a given reference frame is inertial?', 'clarify', ['inertial-frame'],
  'Watch a free body', 'To check a frame, imagine a body with zero net force and watch how it moves in that frame. If it drifts at constant velocity in a straight line, the frame is inertial. If it curves or speeds up with nothing pushing it, the frame is not.',
  'Typical cases', 'The ground is a good enough inertial frame for a game of billiards. A merry-go-round or a braking bus is non-inertial, since objects appear to be flung about by no real force. The clue is always the unexplained motion of a force-free object.',
  ['Test with a force-free body.', 'Constant-velocity drift means inertial.', 'Unexplained curving or speeding means non-inertial.'],
  ['Why does the ground count as inertial?', 'What are fictitious forces?'],
  'It gives a recognition procedure for the objective’s concept.'));

// ===== DIFFERENT-INTENT TRAPS (10 nodes) =====
F.push(mk('L02.M01.O01', 'why-mass-resists-acceleration', 'Why mass resists acceleration',
  'Why does a larger mass need a larger force to reach the same acceleration?', 'deepen', ['mass', 'newtons-second-law'],
  'Inertia as reluctance', 'Mass is a measure of how strongly a body resists having its motion changed. A more massive body has more of this reluctance, so a given push produces less change. That is the deep reason mass sits where it does in F = ma.',
  'A conceptual, not numerical, point', 'This is about why the relationship exists, not about plugging numbers into a = F / m. The larger the mass, the larger the force needed for the same acceleration, because there is more inertia to overcome. Understanding the why makes the formula feel inevitable.',
  ['Mass measures resistance to changing motion.', 'More mass means less acceleration per unit force.', 'This explains why mass appears in F = ma.'],
  ['How would I actually calculate the acceleration?', 'Is inertia the same as mass?'],
  'It deepens the meaning of mass rather than computing with it.'));
F.push(mk('L01.M01.O02', 'why-velocity-is-a-vector', 'Why velocity is a vector',
  'Why is velocity treated as a vector while speed is only a number?', 'deepen', ['kinematic-quantities'],
  'Direction carries information', 'Two cars at 50 km/h heading opposite ways have the same speed but different velocities, and the difference matters for what happens next. Because motion has a direction that changes outcomes, velocity must record direction as well as size. Speed throws that direction away.',
  'Why the distinction is not pedantic', 'Whenever direction changes, velocity changes even if speed does not, and that is what lets acceleration exist in a turn. Treating velocity as a mere number would hide such changes. So the vector nature is essential, not decoration.',
  ['Velocity keeps direction; speed does not.', 'Same speed can mean different velocities.', 'Direction change is a velocity change.'],
  ['How do I convert a speed into a velocity?', 'What units does velocity use?'],
  'It explains why velocity is a vector, not how to compute one.'));
F.push(mk('L02.M02.O01', 'why-action-reaction-dont-cancel', 'Why action-reaction forces don’t cancel',
  'Why don’t the equal and opposite forces of a third-law pair cancel each other out?', 'deepen', ['newtons-third-law'],
  'They act on different bodies', 'Forces cancel only when they act on the same object, but a third-law pair acts on two different bodies. Your push on a cart and the cart’s push on you affect different things, so neither is cancelled. Each force does its work on its own body.',
  'Why this matters', 'Because the pair is split across two bodies, each body can accelerate under the single force it feels. If the forces were on one body they would cancel and nothing would move. The split is exactly what lets interactions produce motion.',
  ['Paired forces act on different bodies.', 'Only same-body forces cancel.', 'The split lets each body accelerate.'],
  ['How do I identify which two forces are the pair?', 'What if the masses are very different?'],
  'It explains a subtlety of the objective without listing pairs.'));
F.push(mk('L01.M01.O01', 'why-inertia-is-not-a-force', 'Why inertia is not a force',
  'Why is inertia not itself a force?', 'deepen', ['inertia'],
  'A property, not a push', 'Inertia is the tendency of a body to keep its state of motion, but it does not push or pull anything. A force is an interaction between bodies; inertia is just how strongly one body resists change. Calling inertia a force confuses a property with an action.',
  'The lurch is not a force', 'When a bus stops and you feel thrown forward, no "inertia force" pushed you; you simply kept moving while the bus slowed. The feeling is continued motion, not a new push. Naming it a force invents something that is not there.',
  ['Inertia is a property, not a force.', 'Forces are interactions between bodies.', 'The forward lurch is continued motion.'],
  ['How is inertia measured?', 'Why does a seatbelt help then?'],
  'It deepens the inertia concept rather than applying it.'));
F.push(mk('L01.M02.O01', 'why-equilibrium-means-zero-net-force', 'Why equilibrium means zero net force',
  'Why does mechanical equilibrium require the net force to be exactly zero?', 'deepen', ['net-force', 'newtons-first-law'],
  'From the first law', 'The first law says motion changes only when a net force acts, so a body whose motion is not changing must feel zero net force. Equilibrium is precisely the state of unchanging motion, at rest or at constant velocity. Hence the net force must vanish.',
  'Balance of every direction', 'Zero net force means the forces cancel in every direction at once, not just up and down. If any direction had a leftover force, the body would start to accelerate that way. Equilibrium is therefore a statement about the whole vector sum being zero.',
  ['Unchanging motion implies zero net force.', 'Equilibrium follows from the first law.', 'Forces must cancel in every direction.'],
  ['How do I show a specific object is in equilibrium?', 'Does constant velocity count as equilibrium?'],
  'It explains the reason behind the objective’s equilibrium rule.'));
F.push(mk('L02.M01.O02', 'why-acceleration-follows-net-force', 'Why acceleration follows the net force',
  'Why does the acceleration always point in the same direction as the net force?', 'deepen', ['newtons-second-law', 'kinematic-quantities'],
  'The law is a vector equation', 'F = ma relates two vectors with mass, a positive number, between them. Multiplying a vector by a positive number cannot change its direction, only its length. So acceleration must point exactly where the net force points.',
  'What that means physically', 'Whatever way the leftover push points, the change in motion builds up that same way. Push forward and the body speeds up forward; push sideways and its path bends toward the push. Direction of cause equals direction of effect.',
  ['F = ma is a vector equation.', 'Positive mass preserves direction.', 'Acceleration lines up with net force.'],
  ['How would I calculate that acceleration’s size?', 'What if the force direction changes over time?'],
  'It deepens why direction is shared, not how to compute it.'));
F.push(mk('L01.M01.O01', 'measuring-force-in-newtons', 'Measuring a force in newtons',
  'How do you measure the size of a force in newtons using a spring scale?', 'apply', ['net-force'],
  'A spring as a ruler for force', 'A spring stretches in proportion to the pull on it, so its extension can be read as a force. A spring scale is calibrated so that a known weight gives a known reading in newtons. Hang or pull an object and read the marked value.',
  'Getting a good reading', 'Let the reading settle so the spring is in equilibrium, then the scale force balances the applied force. Keep the pull along the spring’s axis, or the reading understates the force. The result is the magnitude of that one force, in newtons.',
  ['A spring scale reads force from extension.', 'Calibration ties extension to newtons.', 'Read it at equilibrium, along the axis.'],
  ['How would I combine two such forces?', 'What is one newton?'],
  'It is a measurement how-to, distinct from adding forces.'));
F.push(mk('L02.M01.O01', 'history-of-the-kilogram', 'A short history of the kilogram',
  'How was the kilogram historically defined as the unit of mass?', 'tangent', ['mass'],
  'From a cylinder to a constant', 'For over a century the kilogram was defined by a platinum-iridium cylinder kept near Paris. Every other mass was compared, directly or indirectly, to that single artefact. Its slow, unexplained drift eventually made the definition unsatisfactory.',
  'The modern redefinition', 'In 2019 the kilogram was redefined using a fixed value of the Planck constant, tying mass to fundamental physics rather than an object. This removed the reliance on a lump of metal that could change. The kilogram is now reproducible in any suitably equipped lab.',
  ['The kilogram was once a physical cylinder.', 'Comparison to that artefact defined all masses.', 'It is now defined via the Planck constant.'],
  ['How does this connect to weight?', 'Why does a stable standard matter?'],
  'It is a historical tangent about the unit of mass.'));
F.push(mk('L01.M02.O02', 'why-earth-is-nearly-inertial', 'Why Earth is nearly inertial',
  'Why can Earth’s surface be treated as an approximately inertial frame despite its rotation?', 'deepen', ['inertial-frame'],
  'Small accelerations', 'Earth rotates and orbits, so strictly its surface is a non-inertial frame. But the accelerations these motions produce are tiny compared with everyday forces, so their effects usually go unnoticed. For most experiments the ground behaves as if inertial.',
  'When the approximation breaks', 'Over large scales or long times the rotation shows up, for instance in the swing of a Foucault pendulum or the curving of winds. There the small effects accumulate and the frame’s non-inertial nature becomes visible. Scale decides whether the approximation holds.',
  ['Earth is strictly non-inertial but nearly inertial.', 'Its accelerations are small day to day.', 'Large scales reveal the rotation.'],
  ['How do I decide if a frame is inertial at all?', 'What is a Foucault pendulum?'],
  'It explains an approximation, not the definition test.'));
F.push(mk('L01.M01.O02', 'reading-velocity-time-graphs', 'Reading a velocity-time graph',
  'How do you read acceleration and distance off a velocity-time graph?', 'apply', ['kinematic-quantities'],
  'Slope is acceleration', 'On a velocity-time graph the vertical axis is velocity and the horizontal axis is time. The steepness of the line, its slope, tells you the acceleration. A rising line means speeding up, a falling line means slowing down.',
  'Area is distance', 'The area between the line and the time axis gives the distance travelled. For straight-line segments this is just triangles and rectangles you can add up. So one graph yields both acceleration and distance.',
  ['Slope of the line is acceleration.', 'Area under the line is distance.', 'Rising means speeding up, falling means slowing.'],
  ['How does this differ from a position-time graph?', 'What does a curved line mean?'],
  'It is a graph-reading how-to, not a concept contrast.'));

// ===== FILLERS (13 distinct nodes) =====
F.push(mk('L01.M01.O01', 'everyday-zero-net-force', 'Everyday examples of zero net force',
  'What are some everyday examples where the net force on an object is zero?', 'example', ['net-force'],
  'Things sitting still', 'A lamp on a desk, a picture on a wall and a parked car all have zero net force. In each case gravity is balanced by a support or friction. Nothing accelerates because the pushes and pulls cancel.',
  'Things moving steadily', 'Zero net force also covers steady motion, like a car cruising at constant speed on a flat road. There the engine’s drive force just balances drag and friction. Constant velocity, not only rest, signals zero net force.',
  ['Resting objects often have zero net force.', 'Steady motion also means zero net force.', 'Balance, not stillness, is the real test.'],
  ['Can a moving object have zero net force?', 'What breaks the balance?'],
  'It gives worked examples of the objective’s zero-net-force idea.'));
F.push(mk('L01.M01.O02', 'units-of-acceleration', 'The units of acceleration',
  'What units is acceleration measured in and why?', 'clarify', ['kinematic-quantities'],
  'Metres per second per second', 'Acceleration is how fast velocity changes each second, so its unit is metres per second, per second, written m/s^2. If a car gains 3 m/s of speed every second, its acceleration is 3 m/s^2. The doubled "per second" is the whole point.',
  'Making sense of the square', 'The seconds appear twice because we track a change in a per-second quantity over more seconds. It is not an area despite the squared look. Reading it aloud as "metres per second, each second" keeps the meaning clear.',
  ['Acceleration is measured in m/s^2.', 'It is a change of velocity per second.', 'The squared second is not an area.'],
  ['How does this relate to g?', 'What are the units of force then?'],
  'It clarifies the units behind the objective’s acceleration.'));
F.push(mk('L01.M02.O01', 'first-law-constant-velocity', 'The first law at constant velocity',
  'How does Newton’s first law apply to a car cruising at constant velocity?', 'apply', ['newtons-first-law', 'net-force'],
  'Steady cruise, zero net force', 'A car holding a steady speed in a straight line has zero net force, even though its engine is working. The drive force forward is exactly matched by drag and rolling resistance backward. The first law then keeps the velocity constant.',
  'What changes the state', 'Press the accelerator and the drive force exceeds resistance, so a net force appears and the car speeds up. Ease off and resistance wins, slowing it down. Only an imbalance changes the cruising state.',
  ['Constant velocity means zero net force.', 'Drive force balances resistance at cruise.', 'An imbalance is needed to change speed.'],
  ['Why does the engine work if net force is zero?', 'How is this different from being parked?'],
  'It applies the objective’s first law to steady motion.'));
F.push(mk('L01.M02.O02', 'fictitious-forces-in-accelerating-frames', 'Fictitious forces in accelerating frames',
  'What fictitious forces appear in a non-inertial (accelerating) reference frame?', 'deepen', ['inertial-frame'],
  'Forces that come from the frame', 'In an accelerating frame, objects seem to be pushed by forces that have no physical source. These are called fictitious or inertial forces, and they appear only because the frame itself is accelerating. In an inertial frame they vanish.',
  'Familiar examples', 'Pressed back into your seat as a car accelerates, or flung outward on a roundabout, you feel such apparent forces. Really you are just resisting the frame’s acceleration through your own inertia. Naming them helps calculation but they are not true interactions.',
  ['Non-inertial frames introduce fictitious forces.', 'They have no physical source body.', 'They disappear in an inertial frame.'],
  ['Is centrifugal force real?', 'How do I switch back to an inertial frame?'],
  'It deepens the objective by contrasting inertial and non-inertial frames.'));
F.push(mk('L02.M01.O01', 'fma-with-multiple-forces', 'Using F = ma with several forces',
  'How do you apply F = ma when several forces act on the same body?', 'apply', ['newtons-second-law', 'net-force'],
  'Sum first, then divide', 'When many forces act, first add them as vectors to get the single net force. Only that net force goes into F = ma. Then the acceleration is the net force divided by the mass.',
  'A quick case', 'A box pushed with 10 N forward while 4 N of friction acts backward feels a net 6 N. If its mass is 2 kg, its acceleration is 3 m/s^2 forward. The trick is always to combine forces before dividing.',
  ['Combine all forces into one net force.', 'Only the net force enters F = ma.', 'Then divide by the mass for acceleration.'],
  ['How do I handle forces at an angle?', 'What if friction is unknown?'],
  'It applies the objective’s law when forces compete.'));
F.push(mk('L02.M01.O02', 'acceleration-on-a-frictionless-incline', 'Acceleration on a frictionless incline',
  'How do you find the acceleration of a block sliding down a frictionless incline?', 'apply', ['newtons-second-law'],
  'Only gravity acts along the slope', 'On a frictionless incline the only force along the slope is the component of gravity pointing downhill. That component is the weight times the sine of the slope angle. Dividing by mass leaves an acceleration of g times sine of the angle.',
  'Why mass drops out', 'Because both the driving force and the inertia grow with mass, the mass cancels and the acceleration depends only on the angle. A steeper slope gives a larger acceleration, up to g for a vertical drop. This makes inclines a neat way to study gravity gently.',
  ['Downhill force is mg sin(theta).', 'Acceleration is g sin(theta).', 'Mass cancels, so only the angle matters.'],
  ['What changes when friction is present?', 'How steep to get half of g?'],
  'It applies the objective’s acceleration method to an incline.'));
F.push(mk('L02.M02.O01', 'third-law-and-rocket-propulsion', 'The third law and rocket propulsion',
  'How does Newton’s third law explain how a rocket accelerates?', 'example', ['newtons-third-law'],
  'Push the gas, get pushed back', 'A rocket burns fuel and hurls hot gas out of its nozzle at high speed. By the third law, as the rocket pushes the gas backward the gas pushes the rocket forward with an equal force. That forward reaction is the thrust.',
  'No air required', 'Because the interaction is between the rocket and its own exhaust, it works in the vacuum of space. The rocket does not push against the air or the ground. This is why rockets, unlike propellers, function beyond the atmosphere.',
  ['Rocket pushes exhaust back; exhaust pushes rocket forward.', 'The forward reaction is the thrust.', 'It needs no air to push against.'],
  ['Does it still work in space?', 'How does exhaust speed affect thrust?'],
  'It is a third-law application to propulsion.'));
F.push(mk('L02.M02.O01', 'third-law-and-walking', 'The third law and walking',
  'How does Newton’s third law explain how we walk forward?', 'example', ['newtons-third-law'],
  'Push the ground backward', 'When you walk, your foot pushes backward against the ground. By the third law the ground pushes forward on your foot with an equal force. That forward push from the ground is what drives you ahead.',
  'Why grip matters', 'The ground can only push forward if friction lets your foot grip it, which is why ice makes walking hard. With little friction the paired push is weak and you slip. Traction is really the third law made useful.',
  ['Foot pushes ground back; ground pushes you forward.', 'The ground’s push moves you.', 'Friction enables the paired forces.'],
  ['Why is walking on ice hard?', 'How is running different?'],
  'It gives a second everyday third-law example.'));
F.push(mk('L01.M01.O01', 'friction-as-a-force', 'Friction as one of the forces',
  'How does friction fit into the net force on a sliding object?', 'deepen', ['net-force'],
  'A force that opposes sliding', 'Friction is a contact force that acts along a surface, always opposing the relative sliding. When you push a crate, friction points backward against your push. It is one of the forces you add up to find the net force.',
  'Its effect on motion', 'If your push exceeds friction, the net force is forward and the crate accelerates; if friction wins, it slows or stays put. Reduce friction, as on ice, and a small push produces a large net force. Friction rarely acts alone but always counts in the sum.',
  ['Friction opposes relative sliding.', 'It enters the net force like any force.', 'Its balance with the push sets the motion.'],
  ['What is the difference between static and kinetic friction?', 'How does surface roughness matter?'],
  'It adds friction to the objective’s catalogue of forces.'));
F.push(mk('L02.M01.O01', 'the-newton-as-a-unit', 'The newton as a unit of force',
  'What is one newton of force in terms of mass and acceleration?', 'clarify', ['newtons-second-law'],
  'Defined by F = ma', 'One newton is the force that gives a one-kilogram mass an acceleration of one metre per second squared. It comes straight from F = ma with the numbers set to one. So a newton is a kilogram-metre per second squared.',
  'A feel for the size', 'Roughly, holding a small apple against gravity takes about one newton. Everyday pushes are a few to a few hundred newtons. Knowing this keeps your force answers sensible.',
  ['One newton accelerates 1 kg at 1 m/s^2.', 'It equals kg·m/s^2.', 'About the weight of a small apple.'],
  ['How many newtons is my weight?', 'How does this relate to the kilogram?'],
  'It clarifies the unit implied by the objective’s law.'));
F.push(mk('L01.M02.O01', 'tension-in-a-rope-at-rest', 'Tension in a rope at rest',
  'How do you find the tension in a rope holding a hanging weight at rest?', 'apply', ['net-force', 'newtons-first-law'],
  'Balance the hanging weight', 'A weight hanging still from a rope is in equilibrium, so the upward tension exactly balances the downward weight. That makes the tension equal to the weight, which is mass times g. Nothing accelerates, so the forces must cancel.',
  'Reading the setup', 'If a 2 kg mass hangs at rest, its weight is about 20 N, so the rope tension is about 20 N. A rope can only pull, never push, so the tension always points along the rope away from the object. At rest, that pull matches the load.',
  ['A hanging weight at rest is in equilibrium.', 'Tension equals the weight, mg.', 'Ropes pull only, along their length.'],
  ['What if the weight is accelerating?', 'How do two ropes share a load?'],
  'It applies the objective’s equilibrium idea to a rope.'));
F.push(mk('L02.M01.O02', 'acceleration-of-two-connected-blocks', 'Acceleration of two connected blocks',
  'How do you calculate the acceleration of two connected blocks pulled by one force?', 'apply', ['newtons-second-law'],
  'Treat them as one system', 'When two blocks are joined by a rope and pulled, the simplest first step is to treat them as a single mass equal to their total. The applied force divided by the total mass gives the shared acceleration. Both blocks accelerate together at that rate.',
  'Finding the internal tension', 'To get the rope tension, apply F = ma to just one block using the shared acceleration. The tension is whatever force gives that block its share of the acceleration. Splitting the system this way solves both unknowns.',
  ['Total force over total mass gives the acceleration.', 'Both blocks share that acceleration.', 'Apply F = ma to one block for the tension.'],
  ['What if there is friction under a block?', 'How does a hanging block change it?'],
  'It extends the objective’s method to a two-body system.'));
F.push(mk('L01.M01.O02', 'instantaneous-vs-average-velocity', 'Instantaneous versus average velocity',
  'What is the difference between instantaneous and average velocity?', 'contrast', ['kinematic-quantities'],
  'Now versus over a stretch', 'Average velocity is the total displacement divided by the total time for a trip. Instantaneous velocity is the velocity at a single moment, what the speedometer shows. A journey can have a modest average yet high instantaneous values along the way.',
  'When they agree', 'The two are equal only when the velocity is constant throughout. Whenever speed or direction changes, the instantaneous value drifts above or below the average. Distinguishing them avoids mistakes in motion problems.',
  ['Average velocity is displacement over total time.', 'Instantaneous velocity is the value at one instant.', 'They match only for constant velocity.'],
  ['How do I compute an average over several legs?', 'Which does a speedometer show?'],
  'It contrasts two velocity measures under the objective.'));

// ---- write node.json files ----
let count = 0;
for (const f of F) {
  const dir = path.join(NODES, f.parent, f.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'node.json'), JSON.stringify(f.node, null, 2) + '\n');
  count++;
}
console.log('wrote ' + count + ' follow-up node.json files');

// ---- plants.json ----
const groups = {
  D1: ['adding-forces-different-directions', 'vector-sum-of-two-forces', 'combine-forces-with-vectors'].map(s => 'L01.M01.O01/' + s),
  D2: ['mass-versus-weight', 'how-mass-and-weight-differ', 'distinguishing-mass-from-weight'].map(s => 'L02.M01.O01/' + s),
  D3: ['seatbelt-and-inertia', 'why-seatbelts-work'].map(s => 'L01.M01.O01/' + s),
  D4: ['rearrange-fma-for-acceleration', 'solving-fma-for-a'].map(s => 'L02.M01.O01/' + s),
  D5: ['identifying-action-reaction-pairs', 'spotting-third-law-pairs'].map(s => 'L02.M02.O01/' + s),
  D6: ['book-on-table-balanced-forces', 'why-resting-objects-stay-put'].map(s => 'L01.M02.O01/' + s),
  D7: ['acceleration-vs-velocity', 'how-acceleration-differs-from-velocity'].map(s => 'L01.M01.O02/' + s),
  D8: ['do-heavier-objects-fall-faster', 'falling-speed-and-weight'].map(s => 'L02.M01.O01/' + s),
  D9: ['what-makes-a-frame-inertial', 'recognizing-inertial-frames'].map(s => 'L01.M02.O02/' + s),
};
const traps = [
  { id: 'L02.M01.O01/why-mass-resists-acceleration', overlaps: 'L02.M01.O01/rearrange-fma-for-acceleration', shared_concepts: ['mass', 'newtons-second-law'], trap_intent: 'why (deepen)', target_intent: 'how-to-calculate (apply)' },
  { id: 'L01.M01.O02/why-velocity-is-a-vector', overlaps: 'L01.M01.O02/acceleration-vs-velocity', shared_concepts: ['kinematic-quantities'], trap_intent: 'why (deepen)', target_intent: 'how-differs (contrast)' },
  { id: 'L02.M02.O01/why-action-reaction-dont-cancel', overlaps: 'L02.M02.O01/identifying-action-reaction-pairs', shared_concepts: ['newtons-third-law'], trap_intent: 'why (deepen)', target_intent: 'how-to-identify (apply)' },
  { id: 'L01.M01.O01/why-inertia-is-not-a-force', overlaps: 'L01.M01.O01/seatbelt-and-inertia', shared_concepts: ['inertia'], trap_intent: 'why (deepen)', target_intent: 'example (apply)' },
  { id: 'L01.M02.O01/why-equilibrium-means-zero-net-force', overlaps: 'L01.M02.O01/book-on-table-balanced-forces', shared_concepts: ['net-force', 'newtons-first-law'], trap_intent: 'why (deepen)', target_intent: 'example (apply)' },
  { id: 'L02.M01.O02/why-acceleration-follows-net-force', overlaps: 'L02.M01.O02/acceleration-on-a-frictionless-incline', shared_concepts: ['newtons-second-law'], trap_intent: 'why (deepen)', target_intent: 'how-to-calculate (apply)' },
  { id: 'L01.M01.O01/measuring-force-in-newtons', overlaps: 'L01.M01.O01/adding-forces-different-directions', shared_concepts: ['net-force'], trap_intent: 'how-to-measure (apply)', target_intent: 'how-to-add (deepen)' },
  { id: 'L02.M01.O01/history-of-the-kilogram', overlaps: 'L02.M01.O01/mass-versus-weight', shared_concepts: ['mass'], trap_intent: 'history (tangent)', target_intent: 'concept-contrast (clarify)' },
  { id: 'L01.M02.O02/why-earth-is-nearly-inertial', overlaps: 'L01.M02.O02/what-makes-a-frame-inertial', shared_concepts: ['inertial-frame'], trap_intent: 'why-approximation (deepen)', target_intent: 'definition-test (clarify)' },
  { id: 'L01.M01.O02/reading-velocity-time-graphs', overlaps: 'L01.M01.O02/acceleration-vs-velocity', shared_concepts: ['kinematic-quantities'], trap_intent: 'graph-how-to (apply)', target_intent: 'concept-contrast (contrast)' },
];
const dupOf = {};
for (const g of Object.keys(groups)) {
  const ids = groups[g];
  for (const id of ids) dupOf[id] = ids.filter(x => x !== id);
}
fs.writeFileSync(path.join(__dirname, 'plants.json'), JSON.stringify({
  note: 'E05 planted registry. duplicate_groups: ids in the same group answer the same canonical question with different wording (any is a correct reuse target for the others). traps: different-intent nodes that share words/concepts with a target but answer a different question.',
  duplicate_groups: groups,
  duplicate_of: dupOf,
  traps,
}, null, 2) + '\n');
console.log('wrote plants.json (' + Object.keys(groups).length + ' groups, ' + traps.length + ' traps)');

// ---- registry files ----
function regEntry(n) {
  return {
    id: n.id,
    parent_id: n.parent_id,
    title: n.title,
    canonical_question: n.canonical_question,
    intent: n.intent,
    summary: Array.isArray(n.summary) ? n.summary.join(' ') : String(n.summary),
    concepts: n.concepts,
    depth: n.depth,
    visibility: n.visibility,
    created_by: n.created_by,
    superseded_by: n.superseded_by == null ? null : n.superseded_by,
    reuse_count: 0,
  };
}
// gather all nodes (objectives from disk + followups in memory), group by module
const modules = { 'L01.M01': [], 'L01.M02': [], 'L02.M01': [], 'L02.M02': [] };
function moduleOf(id) { const h = id.split('/')[0].split('.'); return h[0] + '.' + h[1]; }
const OBJ = ['L01.M01.O01', 'L01.M01.O02', 'L01.M02.O01', 'L01.M02.O02', 'L02.M01.O01', 'L02.M01.O02', 'L02.M02.O01'];
for (const oid of OBJ) {
  const n = JSON.parse(fs.readFileSync(path.join(NODES, oid, 'node.json'), 'utf8'));
  modules[moduleOf(oid)].push(regEntry(n));
}
for (const f of F) modules[moduleOf(f.id)].push(regEntry(f.node));

const idxModules = [];
for (const mid of Object.keys(modules)) {
  const reg = {
    schema: 'metadax.registry/0.2',
    course_id: 'newtons-laws-motion',
    module_id: mid,
    updated_at: 'runtime',
    nodes: modules[mid],
  };
  fs.writeFileSync(path.join(REG, mid + '.json'), JSON.stringify(reg, null, 2) + '\n');
  idxModules.push({ id: mid, file: 'registry/' + mid + '.json', node_count: modules[mid].length, updated_at: 'runtime' });
}
fs.writeFileSync(path.join(REG, 'index.json'), JSON.stringify({
  schema: 'metadax.registry-index/0.2',
  course_id: 'newtons-laws-motion',
  updated_at: 'runtime',
  modules: idxModules,
}, null, 2) + '\n');
const total = Object.values(modules).reduce((a, m) => a + m.length, 0);
console.log('wrote 4 registry files + index; total nodes = ' + total);
for (const mid of Object.keys(modules)) console.log('  ' + mid + ': ' + modules[mid].length);
